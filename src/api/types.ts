export type PostTier = 'free' | 'paid';

/** Feed tab: omit tier query for "all" */
export type FeedTierFilter = 'all' | PostTier;

export interface Author {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  bio?: string;
  subscribersCount?: number;
  isVerified?: boolean;
}

export interface Post {
  id: string;
  author: Author;
  title: string;
  body: string;
  preview: string;
  coverUrl: string;
  likesCount: number;
  commentsCount: number;
  /** Omitted by some API responses; treat as not liked when absent */
  isLiked?: boolean;
  tier: PostTier;
  createdAt: string;
}

export interface PostsResponse {
  ok: boolean;
  data: {
    posts: Post[];
    nextCursor: string | null;
    hasMore: boolean;
  };
}

export interface PostDetailResponse {
  ok: boolean;
  data: {
    post: Post;
  };
}

export interface LikeResponse {
  ok: boolean;
  data: {
    isLiked: boolean;
    likesCount: number;
  };
}

export interface Comment {
  id: string;
  postId: string;
  author: Author;
  text: string;
  createdAt: string;
  /** When API provides — show per-comment like in post detail (Figma) */
  likesCount?: number;
  isLiked?: boolean;
}

export interface CommentsResponse {
  ok: boolean;
  data: {
    comments: Comment[];
    nextCursor: string | null;
    hasMore: boolean;
  };
}

export interface CommentCreatedResponse {
  ok: boolean;
  data: {
    comment: Comment;
  };
}

export interface ApiErrorBody {
  ok: false;
  error: {
    code: string;
    message: string;
  };
}
