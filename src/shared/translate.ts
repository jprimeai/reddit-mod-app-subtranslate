export type TranslateProvider = 'openai' | 'gemini';

export type TranslateSettings = {
  aiProvider: TranslateProvider;
  apiSecret: string;
  model: string;
  targetLanguage: string;
};

export type TranslateFormValues = {
  sourceText?: string;
  translatedText?: string;
  targetLanguage?: string;
  postReply?: boolean;
};

export const TRANSLATE_FORM_NAME = 'translateForm';

export const DEFAULT_OPENAI_BASE_URL = 'https://api.openai.com/v1';
export const DEFAULT_GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';
