import sqlite3

db_path = "ktb_temp/KTB'22.SQLite3"
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# List tables
cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
tables = cursor.fetchall()
print("Tables:", tables)

# Inspect verses table (assuming it exists, usually 'verses')
for table in tables:
    tname = table[0]
    print(f"\n--- Schema for {tname} ---")
    cursor.execute(f"PRAGMA table_info({tname});")
    print(cursor.fetchall())
    
    print(f"--- Sample data for {tname} ---")
    cursor.execute(f"SELECT * FROM {tname} LIMIT 3;")
    print(cursor.fetchall())

conn.close()
