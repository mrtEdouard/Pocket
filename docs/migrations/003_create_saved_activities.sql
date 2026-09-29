CREATE TABLE IF NOT EXISTS saved_activities (
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

CREATE INDEX IF NOT EXISTS idx_saved_activities_activity
    ON saved_activities(activity_id);
