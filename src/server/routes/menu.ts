import { Hono } from 'hono';
import type { UiResponse } from '@devvit/web/shared';
import { getTranslatableContent } from '../core/content';
import { getTranslateSettings } from '../core/settings';
import { translateText } from '../core/translate';
import { TRANSLATE_FORM_NAME } from '../../shared/translate';

export const menu = new Hono();

menu.post('/translate', async (c) => {
  try {
    const content = await getTranslatableContent();
    if (!content) {
      return c.json<UiResponse>(
        {
          showToast: 'Nothing to translate for this post or comment',
        },
        400
      );
    }

    const config = await getTranslateSettings();

    const { translatedText, cached } = await translateText(content.text, config);

    return c.json<UiResponse>(
      {
        showForm: {
          name: TRANSLATE_FORM_NAME,
          form: {
            title: 'Review translation',
            description: cached
              ? `Loaded cached translation into ${config.targetLanguage}.`
              : `Translated ${content.label} into ${config.targetLanguage}.`,
            acceptLabel: 'Close',
            fields: [
              {
                type: 'paragraph',
                name: 'sourceText',
                label: 'Original',
                defaultValue: content.text,
                disabled: true,
              },
              {
                type: 'paragraph',
                name: 'translatedText',
                label: 'Translation',
                defaultValue: translatedText,
                required: true,
                lineHeight: Math.max(20, Math.ceil(translatedText.length / 8)),         
              },
              {
                type: 'string',
                name: 'targetLanguage',
                label: 'Target language',
                defaultValue: config.targetLanguage,
                disabled: true,
              },
            ],
          },
        },
      },
      200
    );
  } catch (error) {
    console.error(`Error translating content: ${error}`);
    const message =
      error instanceof Error ? error.message : 'Failed to translate content';
    return c.json<UiResponse>(
      {
        showToast: message,
      },
      400
    );
  }
});
