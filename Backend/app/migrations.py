"""Additive legacy migration. Inspect before ALTER; never drop user data."""

from sqlalchemy import inspect, text
from app.database import Base


def migrate(engine):
    Base.metadata.create_all(engine)
    additions = {
        "users": {
            "google_id": "VARCHAR(255)",
            "picture": "VARCHAR(500)",
            "auth_provider": "VARCHAR(50) DEFAULT 'local'",
        },
        "wellness_checkins": {"available_minutes": "INTEGER"},
        "team_moods": {"team_id": "INTEGER"},
        "kudos": {"team_id": "INTEGER"},
        "trusted_contacts": {"role": "VARCHAR(20) DEFAULT 'trusted_contact'"},
        "wellness_profiles": {
            "language": "VARCHAR(10) DEFAULT 'en'",
            "interests": "JSON",
            "available_time_description": "VARCHAR(200)",
            "city": "VARCHAR(100)",
        },
    }
    with engine.begin() as conn:
        for table, fields in additions.items():
            columns = {c["name"] for c in inspect(conn).get_columns(table)}
            for name, sqltype in fields.items():
                if name not in columns:
                    conn.execute(
                        text(f"ALTER TABLE {table} ADD COLUMN {name} {sqltype}")
                    )
        conn.execute(
            text(
                "CREATE UNIQUE INDEX IF NOT EXISTS ix_users_google_identity ON users (google_id)"
            )
        )

    # create_all does not add new indexes to an already existing table.
    for index in Base.metadata.tables["intervention_sessions"].indexes:
        if index.name == "uq_active_session_per_user":
            index.create(engine, checkfirst=True)
