import { useNavigate, useParams } from "react-router-dom";

import { CommentsSection } from "../components/CommentsSection";
import { recruitmentAnnouncements } from "../data/recruitmentAnnouncements";
import type { User } from "../types/user";

export function RecruitmentAnnouncementDetailPage({ user }: { user: User | null }) {
  const navigate = useNavigate();
  const { announcementId } = useParams();
  const announcement = recruitmentAnnouncements.find(
    (candidate) => candidate.id === announcementId,
  );

  if (!announcement) {
    return (
      <section className="public-profile-error">
        <p>Annonce de recrutement introuvable.</p>
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
          <span className="profile-avatar avatar-recruitment" aria-hidden="true">
            {announcement.authorInitials}
          </span>
          <div>
            <strong>{announcement.authorName}</strong>
            <span>{announcement.authorMeta}</span>
          </div>
          <small>Recrutement</small>
        </header>

        <img
          className="detail-cover"
          src={announcement.imageUrl}
          alt={announcement.imageAlt}
        />

        <div className="detail-content">
          <h1>{announcement.title}</h1>
          <p>{announcement.description}</p>
          <ul className="post-facts" aria-label="Informations principales">
            <li>{announcement.role}</li>
            <li>{announcement.ageGroup}</li>
            <li>{announcement.dateRange}</li>
            <li>{announcement.location}</li>
          </ul>
        </div>
      </article>

      <CommentsSection
        currentUser={user}
        targetId={`recruitment-${announcement.id}`}
        targetType="announcement"
        onAuthorClick={(authorId) => navigate(`/utilisateurs/${authorId}`)}
        onLoginRequired={() => navigate("/profil")}
      />
    </section>
  );
}
