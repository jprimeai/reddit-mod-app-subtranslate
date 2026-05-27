import { DEFAULT_GEMINI_BASE_URL, DEFAULT_OPENAI_BASE_URL } from '../../shared/translate';
import type { TranslateSettings } from '../../shared/translate';
import { getCachedTranslation, setCachedTranslation } from './cache';

type TranslateResult = {
  translatedText: string;
  cached: boolean;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function readString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

function readErrorMessage(payload: unknown): string | undefined {
  if (!isRecord(payload) || !isRecord(payload.error)) {
    return undefined;
  }
  return readString(payload.error.message);
}

function readOpenAiTranslation(payload: unknown): string | undefined {
  if (!isRecord(payload) || !Array.isArray(payload.choices)) {
    return undefined;
  }

  const firstChoice = payload.choices[0];
  if (!isRecord(firstChoice) || !isRecord(firstChoice.message)) {
    return undefined;
  }

  return readString(firstChoice.message.content)?.trim();
}

function readGeminiTranslation(payload: unknown): string | undefined {
  if (!isRecord(payload) || !Array.isArray(payload.candidates)) {
    return undefined;
  }

  const firstCandidate = payload.candidates[0];
  if (!isRecord(firstCandidate) || !isRecord(firstCandidate.content)) {
    return undefined;
  }

  const parts = firstCandidate.content.parts;
  if (!Array.isArray(parts) || !isRecord(parts[0])) {
    return undefined;
  }

  return readString(parts[0].text)?.trim();
}

function buildPrompt(text: string, targetLanguage: string): string {
  return [
    `Translate the following text into ${targetLanguage}.`,
    'Preserve markdown formatting and line breaks.',
    'Return only the translated text with no commentary.',
    '',
    text,
  ].join('\n');
}

function trimBaseUrl(baseUrl: string): string {
  return baseUrl.replace(/\/+$/, '');
}

async function translateWithOpenAi(
  text: string,
  config: TranslateSettings
): Promise<TranslateResult> {
  const response = await fetch(`${trimBaseUrl(DEFAULT_OPENAI_BASE_URL)}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.apiSecret}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: config.model,
      temperature: 0.2,
      messages: [
        {
          role: 'system',
          content: 'You are a professional translator for Reddit moderation workflows.',
        },
        {
          role: 'user',
          content: buildPrompt(text, config.targetLanguage),
        },
      ],
    }),
  });

  const payload: unknown = await response.json();
  if (!response.ok) {
    throw new Error(
      readErrorMessage(payload) ?? `OpenAI-compatible API error (${response.status})`
    );
  }

  const translatedText = readOpenAiTranslation(payload);
  if (!translatedText) {
    throw new Error('Translation API returned an empty response');
  }

  return { translatedText, cached: false };
}

async function translateWithGemini(
  text: string,
  config: TranslateSettings
): Promise<TranslateResult> {
  const model = encodeURIComponent(config.model);
  const response = await fetch(
    `${trimBaseUrl(DEFAULT_GEMINI_BASE_URL)}/models/${model}:generateContent?key=${encodeURIComponent(config.apiSecret)}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: buildPrompt(text, config.targetLanguage) }],
          },
        ],
        generationConfig: {
          temperature: 0.2,
        },
      }),
    }
  );

  const payload: unknown = await response.json();
  if (!response.ok) {
    throw new Error(readErrorMessage(payload) ?? `Gemini API error (${response.status})`);
  }

  const translatedText = readGeminiTranslation(payload);
  if (!translatedText) {
    throw new Error('Gemini returned an empty translation');
  }

  return { translatedText, cached: false };
}

export async function translateText(
  text: string,
  config: TranslateSettings
): Promise<TranslateResult> {
  if (!config.apiSecret) {
    throw new Error('Add an API secret on the subreddit app install settings page before translating');
  }

  const cachedTranslation = await getCachedTranslation(text, config);
  if (cachedTranslation) {
    return { translatedText: cachedTranslation, cached: true };
  }

  const result =
    config.aiProvider === 'gemini'
      ? await translateWithGemini(text, config)
      : await translateWithOpenAi(text, config);

  await setCachedTranslation(text, config, result.translatedText);
  return result;
}
