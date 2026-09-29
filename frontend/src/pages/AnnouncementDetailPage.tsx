import { useNavigate, useParams } from "react-router-dom";

import { CommentsSection } from "../components/CommentsSection";
import { homePosts } from "../data/home";
import type { User } from "../types/user";

export function AnnouncementDetailPage({ user }: { user: User | null }) {
  const navigate = useNavigate();
  const { postId } = useParams();
  const post = homePosts.find((homePost) => String(homePost.id) === postId);

  if (!post) {
    return (
      <section className="public-profile-error">
        <p>Publication introuvable.</p>
        <button type="button" onClick={() => navigate("/")}>Retour au fil</button>
      </section>
    );
  }

  return (
    <section className="detail-page">
      <button className="detail-back" type="button" onClick={() => navigate("/")}>
        ← Retour au fil
      </button>

      <article className="detail-card">
        <header className="detail-author">
          <span className={`profile-avatar avatar-${post.tone}`} aria-hidden="true">
            {post.initials}
          </span>
          <div>
            <strong>{post.author}</strong>
            <span>{post.meta}</span>
          </div>
          <small>{post.category}</small>
        </header>

        <img className="detail-cover" src={post.image} alt={post.imageAlt} />

        <div className="detail-content">
          <h1>{post.title}</h1>
          <p>{post.body}</p>
          <ul className="post-facts" aria-label="Informations principales">
            {post.facts.map((fact) => <li key={fact}>{fact}</li>)}
          </ul>
        </div>
      </article>

      <CommentsSection
        currentUser={user}
        targetId={`feed-${post.id}`}
        targetType="announcement"
        onAuthorClick={(authorId) => navigate(`/utilisateurs/${authorId}`)}
        onLoginRequired={() => navigate("/profil")}
      />
    </section>
  );
}
