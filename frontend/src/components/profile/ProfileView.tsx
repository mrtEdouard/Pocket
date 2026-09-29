import { useState } from "react";

import { profileMock } from "../../data/profileMock"; // Charge les mocks
import type { User } from "../../types/user";

type ProfileTab = "posts" | "activities" | "saved";

interface ProfileViewProps {
  user: User;
}

const tabs: Array<{ id: ProfileTab; label: string }> = [ // Sous tab
  { id: "posts", label: "Publications" },
  { id: "activities", label: "Activités" },
  { id: "saved", label: "Enregistrés" },
];

export function ProfileView({ user }: ProfileViewProps) {
  const [activeTab, setActiveTab] = useState<ProfileTab>("posts");

  return (
    <section className="social-profile">
      <header className="social-profile-header">
        <div className="social-profile-avatar">
          <img src={profileMock.avatarUrl} alt={`Photo de ${user.name}`} />
        </div>

        <div className="social-profile-main">
          <div className="social-profile-heading">
            <h1>{user.name}</h1>

            <button type="button">
              Modifier le profil
            </button>
          </div>

          <dl className="social-profile-stats">
            <div>
              <dt>Activités</dt>
              <dd>{profileMock.posts.length}</dd>
            </div>

            <div>
              <dt>Séjours</dt>
              <dd>{profileMock.staysCount}</dd>
            </div>

            <div>
              <dt>Favoris</dt>
              <dd>{profileMock.favoritesCount}</dd>
            </div>
          </dl>

          <div className="social-profile-bio">
            <strong>
              {profileMock.role} · {profileMock.city}
            </strong>
            <p>{profileMock.bio}</p>
          </div>
        </div>
      </header>

      <nav className="social-profile-tabs" aria-label="Contenu du profil">
        {tabs.map((tab) => (
          <button
            type="button"
            role="tab"
            key={tab.id}
            aria-selected={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <section className="social-profile-gallery">
        {profileMock.posts.map((post) => (
          <button type="button" key={post.id}>
            <img src={post.imageUrl} alt={post.title} />
            <span className="sr-only">{post.title}</span>
          </button>
        ))}
      </section>
    </section>
  );
}