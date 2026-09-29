import type {
  Comment,
  CommentTargetType,
} from "../types/comment";

const API_URL = (
  import.meta.env.VITE_API_URL ?? "http://localhost:3000"
).replace(/\/$/, "");

interface ApiError {
  message?: string;
}

async function getErrorMessage(response: Response): Promise<string> {
  const error = (await response.json().catch(() => null)) as ApiError | null;
  return error?.message ?? `Erreur HTTP ${response.status}.`;
}

export async function getComments(
  targetType: CommentTargetType,
  targetId: string,
  signal?: AbortSignal,
): Promise<Comment[]> {
  const response = await fetch(
    `${API_URL}/comments/${targetType}/${targetId}`,
    { headers: { Accept: "application/json" }, signal },
  );

  if (!response.ok) throw new Error(await getErrorMessage(response));
  return (await response.json()) as Comment[];
}

export async function createComment(
  targetType: CommentTargetType,
  targetId: string,
  content: string,
): Promise<Comment> {
  const response = await fetch(
    `${API_URL}/comments/${targetType}/${targetId}`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ content }),
    },
  );

  if (!response.ok) throw new Error(await getErrorMessage(response));
  return (await response.json()) as Comment;
}
