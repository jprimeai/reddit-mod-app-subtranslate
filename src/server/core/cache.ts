import { createHash } from 'node:crypto';
import { redis } from '@devvit/web/server';
import type { TranslateSettings } from '../../shared/translate';

const CACHE_KEY_PREFIX = 'subtranslate:translation:';

function buildCacheKey(text: string, config: TranslateSettings): string {
  const payload = [config.aiProvider, config.model, config.targetLanguage, text].join('\0');
  const hash = createHash('sha256').update(payload).digest('hex');
  return `${CACHE_KEY_PREFIX}${hash}`;
}

export async function getCachedTranslation(
  text: string,
  config: TranslateSettings
): Promise<string | undefined> {
  return redis.get(buildCacheKey(text, config));
}

export async function setCachedTranslation(
  text: string,
  config: TranslateSettings,
  translatedText: string
): Promise<void> {
  await redis.set(buildCacheKey(text, config), translatedText);
}
