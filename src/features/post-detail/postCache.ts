import type { InfiniteData, QueryClient } from '@tanstack/react-query';

import type { Comment, Post } from '@/src/api/types';

export type FeedPageData = {
  posts: Post[];
  nextCursor: string | null;
  hasMore: boolean;
};

export type CommentsPageData = {
  comments: Comment[];
  nextCursor: string | null;
  hasMore: boolean;
};

export function postDetailKey(userId: string, postId: string) {
  return ['post', postId, userId] as const;
}

export function commentsKey(userId: string, postId: string) {
  return ['comments', postId, userId] as const;
}

export function patchPostInCaches(
  queryClient: QueryClient,
  userId: string,
  postId: string,
  patch: Partial<Pick<Post, 'likesCount' | 'isLiked' | 'commentsCount'>>
) {
  queryClient.setQueryData<Post>(postDetailKey(userId, postId), (old) => {
    if (!old) return old;
    return { ...old, ...patch };
  });

  queryClient.setQueriesData<InfiniteData<FeedPageData>>(
    { queryKey: ['posts', 'feed', userId], exact: false },
    (old) => {
      if (!old?.pages) return old;
      return {
        ...old,
        pages: old.pages.map((page) => ({
          ...page,
          posts: page.posts.map((p) => (p.id === postId ? { ...p, ...patch } : p)),
        })),
      };
    }
  );
}

/** API returns comments oldest-first; new comments belong at the end of loaded pages. */
export function appendCommentToCache(
  queryClient: QueryClient,
  userId: string,
  postId: string,
  comment: Comment
): boolean {
  let appended = false;
  queryClient.setQueryData<InfiniteData<CommentsPageData>>(commentsKey(userId, postId), (old) => {
    if (!old?.pages?.length) {
      appended = true;
      return {
        pageParams: [undefined],
        pages: [{ comments: [comment], nextCursor: null, hasMore: false }],
      };
    }
    const lastIdx = old.pages.length - 1;
    const last = old.pages[lastIdx];
    if (last.comments.some((c) => c.id === comment.id)) return old;
    appended = true;
    const nextPages = old.pages.slice();
    nextPages[lastIdx] = { ...last, comments: [...last.comments, comment] };
    return { ...old, pages: nextPages };
  });
  return appended;
}
