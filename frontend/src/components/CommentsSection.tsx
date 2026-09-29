import { useEffect, useState, type FormEvent } from "react";

import { createComment, getComments } from "../api/comments";
import type { Comment, CommentTargetType } from "../types/comment";
import type { User } from "../types/user";

interface CommentsSectionProps {
  currentUser: User | null;
  onAuthorClick: (authorId: string) => void;
  onLoginRequired: () => void;
  targetId: string;
  targetType: CommentTargetType;
}

export function CommentsSection({
  currentUser,
  onAuthorClick,
  onLoginRequired,
  targetId,
  targetType,
}: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    setError(null);

    getComments(targetType, targetId, controller.signal)
      .then(setComments)
      .catch((caughtError: unknown) => {
        if (!controller.signal.aborted) {
          setError(
            caughtError instanceof Error
              ? caughtError.message
              : "Impossible de charger les commentaires.",
          );
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [targetId, targetType]);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();

    const trimmedContent = content.trim();
    if (!trimmedContent) return;

    setError(null);
    setIsSubmitting(true);

    try {
      const comment = await createComment(targetType, targetId, trimmedContent);
      setComments((currentComments) => [...currentComments, comment]);
      setContent("");
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Impossible d’envoyer le commentaire.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="comments-section" aria-labelledby="comments-title">
      <header>
        <h2 id="comments-title">Commentaires</h2>
        <span>{comments.length}</span>
      </header>

      {isLoading ? (
        <p className="comments-status">Chargement…</p>
      ) : comments.length === 0 ? (
        <p className="comments-status">Aucun commentaire pour le moment.</p>
      ) : (
        <ul className="comment-list">
          {comments.map((comment) => (
            <li key={comment.id}>
              <span className="comment-avatar" aria-hidden="true">
                {comment.authorName.charAt(0).toUpperCase()}
              </span>
              <div>
                <button
                  type="button"
                  onClick={() => onAuthorClick(comment.authorId)}
                >
                  {comment.authorName}
                </button>
                <p>{comment.content}</p>
              </div>
            </li>
          ))}
        </ul>
      )}

      {currentUser ? (
        <form className="comment-form" onSubmit={handleSubmit}>
          <label>
            <span className="sr-only">Ajouter un commentaire</span>
            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="Ajouter un commentaire…"
              maxLength={500}
              rows={3}
              required
            />
          </label>
          <button type="submit" disabled={isSubmitting || !content.trim()}>
            {isSubmitting ? "Envoi…" : "Publier"}
          </button>
        </form>
      ) : (
        <button className="comment-login" type="button" onClick={onLoginRequired}>
          Se connecter pour commenter
        </button>
      )}

      {error && (
        <p className="comments-error" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}
