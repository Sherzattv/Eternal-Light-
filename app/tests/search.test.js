/**
 * Tests for search.js module
 * Tests parseQuery, fetchVerse, and fullTextSearch functions
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { parseQuery, fetchVerse, fullTextSearch, BIBLE_BOOKS, BOOK_TITLES, getBookTitle } from '../js/modules/search.js';

// Mock database for testing
const mockDatabase = {
    Books: [
        {
            BookId: 43,
            BookName: 'От Иоанна',
            Chapters: [
                {
                    ChapterId: 3,
                    Verses: [
                        { VerseId: 16, Text: 'Ибо так возлюбил Бог мир, что отдал Сына Своего Единородного...' },
                        { VerseId: 17, Text: 'Ибо не послал Бог Сына Своего в мир, чтобы судить мир...' },
                        { VerseId: 18, Text: 'Верующий в Него не судится...' }
                    ]
                }
            ]
        },
        {
            BookId: 1,
            BookName: 'Бытие',
            Chapters: [
                {
                    ChapterId: 1,
                    Verses: [
                        { VerseId: 1, Text: 'В начале сотворил Бог небо и землю.' },
                        { VerseId: 2, Text: 'Земля же была безвидна и пуста...' },
                        { VerseId: 3, Text: 'И сказал Бог: да будет свет. И стал свет.' }
                    ]
                }
            ]
        }
    ]
};

describe('BIBLE_BOOKS mapping', () => {
    it('should contain main book abbreviations', () => {
        expect(BIBLE_BOOKS['мф']).toBe(40);
        expect(BIBLE_BOOKS['ин']).toBe(43);
        expect(BIBLE_BOOKS['быт']).toBe(1);
        expect(BIBLE_BOOKS['рим']).toBe(52);
    });

    it('should contain full book names', () => {
        expect(BIBLE_BOOKS['бытие']).toBe(1);
        expect(BIBLE_BOOKS['иоанна']).toBe(43);
        expect(BIBLE_BOOKS['откровение']).toBe(66);
    });

    it('should contain numbered books', () => {
        expect(BIBLE_BOOKS['1кор']).toBe(53);
        expect(BIBLE_BOOKS['2пет']).toBe(47);
        expect(BIBLE_BOOKS['3ин']).toBe(50);
    });
});

describe('BOOK_TITLES mapping', () => {
    it('should return correct titles for book IDs', () => {
        expect(BOOK_TITLES[1]).toBe('Бытие');
        expect(BOOK_TITLES[43]).toBe('От Иоанна');
        expect(BOOK_TITLES[66]).toBe('Откровение');
    });
});

describe('getBookTitle', () => {
    it('should return title from BOOK_TITLES when no db provided', () => {
        expect(getBookTitle(1)).toBe('Бытие');
        expect(getBookTitle(43)).toBe('От Иоанна');
    });

    it('should return title from database when available', () => {
        expect(getBookTitle(43, mockDatabase)).toBe('От Иоанна');
    });

    it('should fallback to BOOK_TITLES when not in database', () => {
        expect(getBookTitle(99, mockDatabase)).toBe('Библия');
    });
});

describe('parseQuery', () => {
    it('should parse simple references like "ин 3 16"', () => {
        const result = parseQuery('ин 3 16');
        expect(result).not.toBeNull();
        expect(result.bookId).toBe(43);
        expect(result.chapter).toBe('3');
        expect(result.verse).toBe('16');
    });

    it('should parse references with colon like "ин 3:16"', () => {
        const result = parseQuery('ин 3:16');
        expect(result).not.toBeNull();
        expect(result.bookId).toBe(43);
        expect(result.chapter).toBe('3');
        expect(result.verse).toBe('16');
    });

    it('should parse verse ranges like "быт 1 1-3"', () => {
        const result = parseQuery('быт 1 1-3');
        expect(result).not.toBeNull();
        expect(result.bookId).toBe(1);
        expect(result.chapter).toBe('1');
        expect(result.verse).toBe('1-3');
    });

    it('should handle extra whitespace', () => {
        const result = parseQuery('  ин   3   16  ');
        expect(result).not.toBeNull();
        expect(result.bookId).toBe(43);
    });

    it('should handle case insensitivity', () => {
        const result = parseQuery('ИН 3 16');
        expect(result).not.toBeNull();
        expect(result.bookId).toBe(43);
    });

    it('should return null for invalid queries', () => {
        expect(parseQuery('')).toBeNull();
        expect(parseQuery('hello')).toBeNull();
        expect(parseQuery('xyz 1 1')).toBeNull();
    });

    it('should parse numbered books like "1 кор 13 4"', () => {
        const result = parseQuery('1кор 13 4');
        expect(result).not.toBeNull();
        expect(result.bookId).toBe(53);
        expect(result.chapter).toBe('13');
    });
});

describe('fetchVerse', () => {
    it('should fetch a single verse', () => {
        const parsed = parseQuery('ин 3 16');
        const result = fetchVerse(parsed, mockDatabase);

        expect(result).not.toBeNull();
        expect(result.text).toContain('возлюбил Бог');
        expect(result.reference).toBe('От Иоанна 3:16');
    });

    it('should fetch verse range', () => {
        const parsed = parseQuery('быт 1 1-3');
        const result = fetchVerse(parsed, mockDatabase);

        expect(result).not.toBeNull();
        expect(result.text).toContain('В начале');
        expect(result.text).toContain('да будет свет');
    });

    it('should return null for non-existent verse', () => {
        const parsed = { bookId: 99, chapter: '1', verse: '1' };
        const result = fetchVerse(parsed, mockDatabase);

        expect(result).toBeNull();
    });

    it('should return null when database is empty', () => {
        const parsed = parseQuery('ин 3 16');
        const result = fetchVerse(parsed, null);

        expect(result).toBeNull();
    });
});

describe('fullTextSearch', () => {
    it('should find verses containing search term', () => {
        const results = fullTextSearch('возлюбил', mockDatabase);

        expect(results.length).toBeGreaterThan(0);
        expect(results[0].text).toContain('возлюбил');
    });

    it('should be case insensitive', () => {
        const results = fullTextSearch('БОГ', mockDatabase);

        expect(results.length).toBeGreaterThan(0);
    });

    it('should return empty array for no matches', () => {
        const results = fullTextSearch('xyznonexistent', mockDatabase);

        expect(results).toEqual([]);
    });

    it('should respect limit parameter', () => {
        const results = fullTextSearch('Бог', mockDatabase, 2);

        expect(results.length).toBeLessThanOrEqual(2);
    });

    it('should return empty for empty query', () => {
        const results = fullTextSearch('', mockDatabase);

        expect(results).toEqual([]);
    });
});
