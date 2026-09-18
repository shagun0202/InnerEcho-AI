import sqlite3
import os

def migrate():
    db_path = os.path.join(os.path.dirname(__file__), "moodmentor.db")
    if not os.path.exists(db_path):
        print("No moodmentor.db found yet.")
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    cursor.execute("PRAGMA table_info(users)")
    cols = [row[1] for row in cursor.fetchall()]
    print("Existing users columns:", cols)

    columns_to_add = [
        ("google_id", "VARCHAR(255)"),
        ("picture", "VARCHAR(500)"),
        ("auth_provider", "VARCHAR(50) DEFAULT 'local'")
    ]

    for col_name, col_type in columns_to_add:
        if col_name not in cols:
            print(f"Adding column '{col_name}' to users table...")
            cursor.execute(f"ALTER TABLE users ADD COLUMN {col_name} {col_type}")

    conn.commit()

    cursor.execute("PRAGMA table_info(users)")
    print("Updated users columns:", [row[1] for row in cursor.fetchall()])
    conn.close()

if __name__ == "__main__":
    migrate()
