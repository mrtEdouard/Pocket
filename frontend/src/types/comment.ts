export type CommentTargetType = "activity" | "announcement";

export interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
}
