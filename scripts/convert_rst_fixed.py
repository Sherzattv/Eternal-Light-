import json
import os

# Configuration
INPUT_FILE = 'sources/rst.json'
OUTPUT_FILE = 'app/js/data/bible_data.js'
GLOBAL_VAR_NAME = 'BIBLE_DATA'

# Trusted Mapping: BookId -> BookName (Russian)
# Based on standard Western Protestant ordering which matches the content of rst.json IDs
ID_TO_NAME = {
    1: "Бытие", 2: "Исход", 3: "Левит", 4: "Числа", 5: "Второзаконие",
    6: "Иисус Навин", 7: "Судьи", 8: "Руфь",
    9: "1-я Царств", 10: "2-я Царств", 11: "3-я Царств", 12: "4-я Царств",
    13: "1-я Паралипоменон", 14: "2-я Паралипоменон",
    15: "Ездра", 16: "Неемия", 17: "Есфирь",
    18: "Иов", 19: "Псалтирь", 20: "Притчи", 21: "Екклесиаст", 22: "Песнь Песней",
    23: "Исаия", 24: "Иеремия", 25: "Плач Иеремии", 26: "Иезекииль", 27: "Даниил",
    28: "Осия", 29: "Иоиль", 30: "Амос", 31: "Авдий", 32: "Иона", 33: "Михей",
    34: "Наум", 35: "Аввакум", 36: "Софония", 37: "Аггей", 38: "Захария", 39: "Малахия",
    
    40: "От Матфея", 41: "От Марка", 42: "От Луки", 43: "От Иоанна", 44: "Деяния",
    
    45: "Римлянам", 
    46: "1-е Коринфянам", 47: "2-е Коринфянам", 
    48: "Галатам", 49: "Ефесянам", 50: "Филиппийцам", 51: "Колоссянам",
    52: "1-е Фессалоникийцам", 53: "2-е Фессалоникийцам",
    54: "1-е Тимофею", 55: "2-е Тимофею", 56: "Титу", 57: "Филимону",
    58: "Евреям",
    
    59: "Иакова",
    60: "1-е Петра", 61: "2-е Петра",
    62: "1-е Иоанна", 63: "2-е Иоанна", 64: "3-е Иоанна",
    65: "Иуды",
    66: "Откровение"
}

def convert():
    print(f"Reading {INPUT_FILE}...")
    try:
        with open(INPUT_FILE, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except Exception as e:
        print(f"Error reading input file: {e}")
        return

    books = data.get("Books", [])
    print(f"Found {len(books)} books.")

    processed_books = []
    
    for book in books:
        bid = book.get("BookId")
        if not bid:
            continue
            
        original_name = book.get("BookName", "Unknown")
        
        # Override name if we have a trusted one
        if bid in ID_TO_NAME:
            correct_name = ID_TO_NAME[bid]
            if original_name != correct_name:
                print(f"Fixing Book {bid}: '{original_name}' -> '{correct_name}'")
            book["BookName"] = correct_name
        else:
            print(f"Warning: No trusted name for Book ID {bid}. Keeping '{original_name}'")
            
        processed_books.append(book)

    # Reconstruct the full object
    final_data = {
        "Translation": "RST",
        "Books": processed_books
    }

    print(f"Writing to {OUTPUT_FILE}...")
    try:
        with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
            f.write(f"window.{GLOBAL_VAR_NAME} = ")
            json.dump(final_data, f, ensure_ascii=False, separators=(',', ':'))
            f.write(";")
        print("Done!")
    except Exception as e:
        print(f"Error writing output file: {e}")

if __name__ == "__main__":
    convert()
