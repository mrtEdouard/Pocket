-- Petit jeu d'essai local pour l'API Pocket.
-- Ce fichier peut être rejoué sans dupliquer ses données.

INSERT INTO users (name, email, password)
VALUES (
    'Compte de démonstration',
    'demo@pocket.local',
    'demo-password-hash-not-for-login'
)
ON CONFLICT (email) DO NOTHING;

WITH demo_user AS (
    SELECT id
    FROM users
    WHERE email = 'demo@pocket.local'
),
sample_activities (
    title,
    description,
    min_age,
    max_age,
    min_children,
    max_children,
    duration_minutes,
    location_type,
    energy_level,
    is_public
) AS (
    VALUES
        (
            'Chasse au trésor nature',
            'Un parcours en équipes avec des énigmes à résoudre en extérieur.',
            6::SMALLINT,
            12::SMALLINT,
            4,
            20,
            90,
            'outdoor',
            'high',
            TRUE
        ),
        (
            'Atelier cartes postales',
            'Création de cartes illustrées avec des feutres et du papier.',
            5::SMALLINT,
            14::SMALLINT,
            2,
            12,
            45,
            'indoor',
            'low',
            FALSE
        )
)
INSERT INTO activities (
    owner_id,
    title,
    description,
    min_age,
    max_age,
    min_children,
    max_children,
    duration_minutes,
    location_type,
    energy_level,
    is_public
)
SELECT
    demo_user.id,
    sample.title,
    sample.description,
    sample.min_age,
    sample.max_age,
    sample.min_children,
    sample.max_children,
    sample.duration_minutes,
    sample.location_type,
    sample.energy_level,
    sample.is_public
FROM demo_user
CROSS JOIN sample_activities AS sample
WHERE NOT EXISTS (
    SELECT 1
    FROM activities AS existing
    WHERE existing.owner_id = demo_user.id
      AND existing.title = sample.title
);
