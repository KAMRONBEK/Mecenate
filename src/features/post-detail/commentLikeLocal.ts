import type { Comment } from '@/src/api/types';

export type CommentLikeOverride = { likesCount: number; isLiked: boolean };

export function mergeCommentLike(comment: Comment, override?: CommentLikeOverride): CommentLikeOverride {
  if (override) return override;
  return {
    likesCount: comment.likesCount ?? 0,
    isLiked: comment.isLiked === true,
  };
}

/** Local-only toggle until comment like API exists. Pure reducer for useState. */
export function applyCommentLikeToggle(
  prev: Record<string, CommentLikeOverride>,
  comment: Comment
): Record<string, CommentLikeOverride> {
  const cur = mergeCommentLike(comment, prev[comment.id]);
  const nextLiked = !cur.isLiked;
  const nextCount = Math.max(0, cur.likesCount + (nextLiked ? 1 : -1));
  return { ...prev, [comment.id]: { likesCount: nextCount, isLiked: nextLiked } };
}
