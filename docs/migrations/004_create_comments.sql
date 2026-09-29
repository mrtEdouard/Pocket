CREATE TABLE IF NOT EXISTS comments (
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

CREATE INDEX IF NOT EXISTS idx_comments_target
    ON comments(target_type, target_id, created_at);
