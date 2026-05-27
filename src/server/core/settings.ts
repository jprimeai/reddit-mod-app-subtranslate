import { settings } from '@devvit/web/server';
import type { TranslateProvider, TranslateSettings } from '../../shared/translate';

const DEFAULT_MODEL = 'gpt-4o-mini';
const DEFAULT_TARGET_LANGUAGE = 'English';

function normalizeProvider(value: unknown): TranslateProvider {
  if (Array.isArray(value) && value[0] === 'gemini') {
    return 'gemini';
  }
  if (value === 'gemini') {
    return 'gemini';
  }
  return 'openai';
}

function normalizeString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

export async function getTranslateSettings(): Promise<TranslateSettings> {
  const values = await settings.getAll<Record<string, unknown>>();
  const aiProvider = normalizeProvider(values.aiProvider);
  return {
    aiProvider,
    apiSecret: normalizeString(values.apiSecret) ?? '',
    model: normalizeString(values.model) ?? DEFAULT_MODEL,
    targetLanguage: normalizeString(values.targetLanguage) ?? DEFAULT_TARGET_LANGUAGE,
  };
}
