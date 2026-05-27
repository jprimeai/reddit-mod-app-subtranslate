import { Hono } from 'hono';
import type { UiResponse } from '@devvit/web/shared';

export const forms = new Hono();

forms.post('/translate-submit', async (c) => {
  return c.json<UiResponse>(
    {},
    200
  );
});
