CREATE TABLE posts (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    author_id BIGINT NOT NULL,
    activity_id BIGINT NOT NULL,

    content VARCHAR(500) NOT NULL,
    image_url TEXT,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_posts_author
        FOREIGN KEY (author_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_posts_activity
        FOREIGN KEY (activity_id)
        REFERENCES activities(id)
        ON DELETE CASCADE,

    CONSTRAINT chk_posts_content
        CHECK (
            char_length(trim(content)) BETWEEN 1 AND 500
        )
);

CREATE INDEX idx_posts_author
    ON posts(author_id);

CREATE INDEX idx_posts_activity
    ON posts(activity_id);

CREATE INDEX idx_posts_created_at
    ON posts(created_at DESC);