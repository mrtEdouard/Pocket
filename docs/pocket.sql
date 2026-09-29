-- =========================================================
-- POCKET - Base de données PostgreSQL
-- =========================================================


-- =========================================================
-- 1. UTILISATEURS
-- =========================================================

CREATE TABLE users (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- =========================================================
-- 2. SEJOURS
-- =========================================================

CREATE TABLE stays (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    owner_id BIGINT NOT NULL,

    name VARCHAR(150) NOT NULL,

    start_date DATE NOT NULL,
    end_date DATE NOT NULL,

    min_age SMALLINT NOT NULL,
    max_age SMALLINT NOT NULL,

    children_count INTEGER NOT NULL,

    status VARCHAR(20) NOT NULL DEFAULT 'draft',

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_stays_owner
        FOREIGN KEY (owner_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT chk_stays_dates
        CHECK (start_date <= end_date),

    CONSTRAINT chk_stays_ages
        CHECK (
            min_age >= 0
            AND max_age >= min_age
        ),

    CONSTRAINT chk_stays_children
        CHECK (children_count > 0),

    CONSTRAINT chk_stays_status
        CHECK (status IN (
            'draft',
            'active',
            'finished'
        ))
);


-- =========================================================
-- 3. ROLES DANS UN SEJOUR
-- =========================================================

CREATE TABLE roles (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    name VARCHAR(100) NOT NULL UNIQUE
);


-- =========================================================
-- 4. MEMBRES DES SEJOURS
-- =========================================================

CREATE TABLE stay_members (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    stay_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,

    joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_stay_members_stay
        FOREIGN KEY (stay_id)
        REFERENCES stays(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_stay_members_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_stay_members_role
        FOREIGN KEY (role_id)
        REFERENCES roles(id),

    CONSTRAINT uq_stay_member
        UNIQUE (stay_id, user_id)
);


-- =========================================================
-- 5. ACTIVITES
-- =========================================================

CREATE TABLE activities (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    owner_id BIGINT NOT NULL,

    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,

    min_age SMALLINT NOT NULL,
    max_age SMALLINT NOT NULL,

    min_children INTEGER NOT NULL,
    max_children INTEGER NOT NULL,

    duration_minutes INTEGER NOT NULL,

    location_type VARCHAR(20) NOT NULL,
    energy_level VARCHAR(20) NOT NULL,
    image_url TEXT,

    is_public BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_activities_owner
        FOREIGN KEY (owner_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT chk_activities_ages
        CHECK (
            min_age >= 0
            AND max_age >= min_age
        ),

    CONSTRAINT chk_activities_children
        CHECK (
            min_children > 0
            AND max_children >= min_children
        ),

    CONSTRAINT chk_activity_duration
        CHECK (duration_minutes > 0),

    CONSTRAINT chk_activity_location
        CHECK (
            location_type IN (
                'indoor',
                'outdoor',
                'both'
            )
        ),

    CONSTRAINT chk_activity_energy
        CHECK (
            energy_level IN (
                'low',
                'medium',
                'high'
            )
        )
);


-- =========================================================
-- 6. CATEGORIES D'ACTIVITES
-- =========================================================

CREATE TABLE categories (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    name VARCHAR(100) NOT NULL UNIQUE
);


-- =========================================================
-- 7. ASSOCIATION ACTIVITES / CATEGORIES
-- =========================================================

CREATE TABLE activity_categories (
    activity_id BIGINT NOT NULL,
    category_id BIGINT NOT NULL,

    PRIMARY KEY (
        activity_id,
        category_id
    ),

    CONSTRAINT fk_activity_categories_activity
        FOREIGN KEY (activity_id)
        REFERENCES activities(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_activity_categories_category
        FOREIGN KEY (category_id)
        REFERENCES categories(id)
        ON DELETE CASCADE
);


-- =========================================================
-- 8. MATERIEL
-- =========================================================

CREATE TABLE equipment (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    name VARCHAR(100) NOT NULL UNIQUE
);


-- =========================================================
-- 9. MATERIEL NECESSAIRE PAR ACTIVITE
-- =========================================================

CREATE TABLE activity_equipment (
    activity_id BIGINT NOT NULL,
    equipment_id BIGINT NOT NULL,

    quantity INTEGER NOT NULL DEFAULT 1,
    notes VARCHAR(255),

    PRIMARY KEY (
        activity_id,
        equipment_id
    ),

    CONSTRAINT fk_activity_equipment_activity
        FOREIGN KEY (activity_id)
        REFERENCES activities(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_activity_equipment_equipment
        FOREIGN KEY (equipment_id)
        REFERENCES equipment(id)
        ON DELETE CASCADE,

    CONSTRAINT chk_equipment_quantity
        CHECK (quantity > 0)
);


-- =========================================================
-- ACTIVITES ENREGISTREES DANS UNE VALISE
-- =========================================================

CREATE TABLE saved_activities (
    user_id BIGINT NOT NULL,
    activity_id BIGINT NOT NULL,
    saved_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (user_id, activity_id),

    CONSTRAINT fk_saved_activities_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_saved_activities_activity
        FOREIGN KEY (activity_id)
        REFERENCES activities(id)
        ON DELETE CASCADE
);


-- =========================================================
-- COMMENTAIRES DU FIL
-- =========================================================

CREATE TABLE comments (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    author_id BIGINT NOT NULL,
    target_type VARCHAR(20) NOT NULL,
    target_id VARCHAR(100) NOT NULL,
    content VARCHAR(500) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_comments_author
        FOREIGN KEY (author_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT chk_comments_target_type
        CHECK (target_type IN ('activity', 'announcement')),

    CONSTRAINT chk_comments_content
        CHECK (char_length(trim(content)) BETWEEN 1 AND 500)
);


-- =========================================================
-- 10. PLANNING D'UN SEJOUR
-- =========================================================

CREATE TABLE planning_slots (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    stay_id BIGINT NOT NULL,
    activity_id BIGINT NOT NULL,

    starts_at TIMESTAMP NOT NULL,
    ends_at TIMESTAMP NOT NULL,

    expected_children INTEGER NOT NULL,

    notes TEXT,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_planning_slots_stay
        FOREIGN KEY (stay_id)
        REFERENCES stays(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_planning_slots_activity
        FOREIGN KEY (activity_id)
        REFERENCES activities(id),

    CONSTRAINT chk_planning_dates
        CHECK (starts_at < ends_at),

    CONSTRAINT chk_planning_children
        CHECK (expected_children > 0)
);


-- =========================================================
-- 11. AFFECTATION DES ANIMATEURS AUX ACTIVITES
-- =========================================================

CREATE TABLE planning_assignments (
    planning_slot_id BIGINT NOT NULL,
    stay_member_id BIGINT NOT NULL,

    PRIMARY KEY (
        planning_slot_id,
        stay_member_id
    ),

    CONSTRAINT fk_planning_assignments_slot
        FOREIGN KEY (planning_slot_id)
        REFERENCES planning_slots(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_planning_assignments_member
        FOREIGN KEY (stay_member_id)
        REFERENCES stay_members(id)
        ON DELETE CASCADE
);


-- =========================================================
-- INDEX
-- =========================================================

CREATE INDEX idx_stays_owner
    ON stays(owner_id);

CREATE INDEX idx_stay_members_user
    ON stay_members(user_id);

CREATE INDEX idx_activities_owner
    ON activities(owner_id);

CREATE INDEX idx_activities_age
    ON activities(min_age, max_age);

CREATE INDEX idx_activities_children
    ON activities(min_children, max_children);

CREATE INDEX idx_planning_stay
    ON planning_slots(stay_id);

CREATE INDEX idx_planning_dates
    ON planning_slots(starts_at, ends_at);


-- =========================================================
-- DONNEES INITIALES
-- =========================================================

INSERT INTO roles (name) VALUES
    ('Directeur'),
    ('Animateur'),
    ('Assistant sanitaire'),
    ('Surveillant de baignade');


INSERT INTO categories (name) VALUES
    ('Grand jeu'),
    ('Petit jeu'),
    ('Veillée'),
    ('Activité manuelle'),
    ('Sport'),
    ('Retour au calme');


INSERT INTO equipment (name) VALUES
    ('Ballon'),
    ('Plots'),
    ('Chasubles'),
    ('Cordes'),
    ('Feutres'),
    ('Feuilles'),
    ('Ciseaux'),
    ('Enceinte');
