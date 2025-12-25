import sqlite3
import json

db_path = "ktb_temp/KTB'22.SQLite3" # Will unpack here
output_file = 'app/js/data/ktb_data.js'

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# 1. Get Books
# We assume standard canonical order matches the book_number ASC order.
# Canonical MyBible usually: 10=Gen, 20=Exo, ... 470=Matt? 
# Let's just fetch all present books and map them sequentially.
print("Reading books...")
cursor.execute("SELECT book_number, short_name, long_name FROM books ORDER BY book_number")
books_rows = cursor.fetchall()

# Mapping MyBible book_number -> App BookId (1..66)
mybible_to_id = {}
mybible_to_id = {}
app_books = []
search_map = {} # name -> id for search

current_id = 1
for row in books_rows:
    mb_num, short, long = row
    
    # Skip if it's apocrypha? usually > 66 books behave differently. 
    # But for standard 66 books, sequential mapping usually works if the source is standard.
    # Let's hope KTB'22 is standard 66.
    
    mybible_to_id[mb_num] = current_id
    
    # We don't store book metadata in the flat structure used by app (only ID),
    # but the app structure for RST/NRT was:
    # { "BookId": 1, "Chapters": [...] }
    # So we prefer to just prepare the structure.
    
    app_books.append({
        "BookId": current_id,
        "BookName": long, # Added Kazakh name
        "Chapters": {} # ChapterId -> { "ChapterId": ..., "Verses": [] }
    })
    
    # Add to search map (lowercase)
    if short:
        search_map[short.lower()] = current_id
    if long:
        search_map[long.lower()] = current_id
    
    current_id += 1

print(f"Found {len(app_books)} books.")

# 2. Get Verses
print("Reading verses...")
cursor.execute("SELECT book_number, chapter, verse, text FROM verses ORDER BY book_number, chapter, verse")
verses_rows = cursor.fetchall()

for row in verses_rows:
    mb_num, chapter, verse, text = row
    
    if mb_num not in mybible_to_id:
        continue # Skip unknown books (e.g. introductions or extra)
        
    book_id = mybible_to_id[mb_num]
    
    # Find book object in list (id is 1-based index)
    book_obj = app_books[book_id - 1] 
    
    # Ensure chapter exists
    if chapter not in book_obj["Chapters"]:
        book_obj["Chapters"][chapter] = {
            "ChapterId": chapter,
            "Verses": []
        }
    
    # Add verse
    # Clean text: MyBible sometimes has HTML tags like <nb>, <pb>, <f>...
    # Basic cleaning might be needed.
    cleaned_text = text.replace('<pb/>', '').replace('<br/>', ' ').strip()
    # Remove footnotes markers roughly if present (simple check)
    
    book_obj["Chapters"][chapter]["Verses"].append({
        "VerseId": verse,
        "Text": cleaned_text
    })

# 3. Finalize Structure
# Convert Chapters dict to list
final_books = []
for b in app_books:
    chapters_list = []
    # Sort chapters
    for cid in sorted(b["Chapters"].keys()):
        c_obj = b["Chapters"][cid]
        chapters_list.append(c_obj)
    
    if chapters_list:
        b["Chapters"] = chapters_list
        final_books.append(b)

final_data = {
    "Translation": "KTB",
    "Books": final_books
}

print(f"Writing to {output_file}...")
with open(output_file, 'w', encoding='utf-8') as f:
    f.write("const KTB_DATA = ")
    json.dump(final_data, f, ensure_ascii=False, separators=(',', ':'))
    f.write(";")
    
    # Write the search map variable
    f.write("\nconst KTB_BOOK_MAP = ")
    json.dump(search_map, f, ensure_ascii=False, separators=(',', ':'))
    f.write(";")

conn.close()
print("Done!")
