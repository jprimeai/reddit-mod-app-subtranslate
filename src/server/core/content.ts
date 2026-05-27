import { context, reddit } from '@devvit/web/server';

export type TranslatableContent = {
  label: 'post' | 'comment';
  text: string;
};

function buildPostText(title: string, body: string | undefined): string {
  const trimmedBody = body?.trim();
  if (trimmedBody) {
    return `${title.trim()}\n\n${trimmedBody}`;
  }
  return title.trim();
}

export async function getTranslatableContent(): Promise<TranslatableContent | undefined> {
  if (context.commentId) {
    const comment = await reddit.getCommentById(context.commentId);
    const text = comment.body.trim();
    if (!text) {
      return undefined;
    }
    return { label: 'comment', text };
  }

  if (context.postId) {
    const post = await reddit.getPostById(context.postId);
    const text = buildPostText(post.title, post.body);
    if (!text) {
      return undefined;
    }
    return { label: 'post', text };
  }

  return undefined;
}
