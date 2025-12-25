import json

# Input/Output filenames
input_file = 'nrt.json'
output_file = 'nrt_data.js'

print(f"Reading {input_file}...")
with open(input_file, 'r', encoding='utf-8') as f:
    verses = json.load(f)

# Structure to build:
# {
#   "Translation": "NRT",
#   "Books": [
#       {
#           "BookId": 1,
#           "Chapters": [
#               { "ChapterId": 1, "Verses": [ { "VerseId": 1, "Text": "..." } ] }
#           ]
#       }
#   ]
# }

print("Processing verses...")

books_map = {} # BookId -> Book Object

for v in verses:
    book_id = v['book']
    chapter_id = v['chapter']
    verse_id = v['verse']
    text = v['text']
    
    # Ensure Book exists
    if book_id not in books_map:
        books_map[book_id] = {
            "BookId": book_id,
            "Chapters": {} # ChapterId -> Chapter Object
        }
    
    # Ensure Chapter exists
    if chapter_id not in books_map[book_id]["Chapters"]:
        books_map[book_id]["Chapters"][chapter_id] = {
            "ChapterId": chapter_id,
            "Verses": []
        }
    
    # Add Verse
    books_map[book_id]["Chapters"][chapter_id]["Verses"].append({
        "VerseId": verse_id,
        "Text": text
    })

# Convert maps to sorted lists
final_books = []
for bid in sorted(books_map.keys()):
    book_obj = books_map[bid]
    
    # Convert Chapters map to list
    final_chapters = []
    for cid in sorted(book_obj["Chapters"].keys()):
        chapter_obj = book_obj["Chapters"][cid]
        # Sort verses just in case
        chapter_obj["Verses"].sort(key=lambda x: x["VerseId"])
        final_chapters.append(chapter_obj)
    
    book_obj["Chapters"] = final_chapters
    final_books.append(book_obj)

final_data = {
    "Translation": "NRT",
    "Books": final_books
}

print(f"Writing to {output_file}...")
with open(output_file, 'w', encoding='utf-8') as f:
    f.write("const NRT_DATA = ")
    json.dump(final_data, f, ensure_ascii=False, separators=(',', ':'))
    f.write(";")

print("Done!")
