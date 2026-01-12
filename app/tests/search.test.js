/**
 * Tests for search.js module
 * Tests parseQuery, fetchVerse, fullTextSearch with canonical code system
 */

import { describe, it, expect } from 'vitest';
import {
    parseQuery,
    fetchVerse,
    fullTextSearch,
    BIBLE_BOOKS,
    BOOK_TITLES,
    BOOK_INFO,
    TRANSLATION_MAPS
} from '../js/modules/search.js';
import { getCanonicalCode, getBookId, getBookTitle } from '../js/modules/canonical.js';

// Mock database for testing (using RST BookId mapping)
const mockDatabase = {
    Books: [
        {
            BookId: 43, // JHN in RST
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
            BookId: 1, // GEN in RST
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

describe('CANONICAL CODE SYSTEM', () => {
    describe('getCanonicalCode', () => {
        it('should resolve Russian abbreviations', () => {
            expect(getCanonicalCode('ин')).toBe('JHN');
            expect(getCanonicalCode('рим')).toBe('ROM');
            expect(getCanonicalCode('быт')).toBe('GEN');
        });

        it('should resolve full Russian names', () => {
            expect(getCanonicalCode('иоанна')).toBe('JHN');
            expect(getCanonicalCode('римлянам')).toBe('ROM');
            expect(getCanonicalCode('бытие')).toBe('GEN');
        });

        it('should resolve numbered books', () => {
            expect(getCanonicalCode('1кор')).toBe('1CO');
            expect(getCanonicalCode('2пет')).toBe('2PE');
            expect(getCanonicalCode('3ин')).toBe('3JN');
        });
    });

    describe('getBookId', () => {
        it('should return correct BookId for RST', () => {
            expect(getBookId('ROM', 'RST')).toBe(45);
            expect(getBookId('JAS', 'RST')).toBe(59);
            expect(getBookId('1TH', 'RST')).toBe(52);
        });

        it('should return DIFFERENT BookId for KTB', () => {
            expect(getBookId('ROM', 'KTB')).toBe(52);  // Different from RST!
            expect(getBookId('JAS', 'KTB')).toBe(45);  // Different from RST!
            expect(getBookId('1TH', 'KTB')).toBe(59);  // Different from RST!
        });
    });
});

describe('BACKWARDS COMPATIBILITY', () => {
    it('BIBLE_BOOKS should still work with RST IDs', () => {
        expect(BIBLE_BOOKS['мф']).toBe(40);
        expect(BIBLE_BOOKS['ин']).toBe(43);
        expect(BIBLE_BOOKS['быт']).toBe(1);
        expect(BIBLE_BOOKS['рим']).toBe(45);
    });

    it('BOOK_TITLES should return Russian names', () => {
        expect(BOOK_TITLES[1]).toBe('Бытие');
        expect(BOOK_TITLES[43]).toBe('От Иоанна');
        expect(BOOK_TITLES[66]).toBe('Откровение');
    });
});

describe('parseQuery', () => {
    it('should parse simple references and return canonicalCode', () => {
        const result = parseQuery('ин 3 16');
        expect(result).not.toBeNull();
        expect(result.canonicalCode).toBe('JHN');
        expect(result.chapter).toBe('3');
        expect(result.verse).toBe('16');
    });

    it('should parse references with colon', () => {
        const result = parseQuery('ин 3:16');
        expect(result).not.toBeNull();
        expect(result.canonicalCode).toBe('JHN');
        expect(result.chapter).toBe('3');
        expect(result.verse).toBe('16');
    });

    it('should parse verse ranges', () => {
        const result = parseQuery('быт 1 1-3');
        expect(result).not.toBeNull();
        expect(result.canonicalCode).toBe('GEN');
        expect(result.chapter).toBe('1');
        expect(result.verse).toBe('1-3');
    });

    it('should handle extra whitespace', () => {
        const result = parseQuery('  ин   3   16  ');
        expect(result).not.toBeNull();
        expect(result.canonicalCode).toBe('JHN');
    });

    it('should handle case insensitivity', () => {
        const result = parseQuery('ИН 3 16');
        expect(result).not.toBeNull();
        expect(result.canonicalCode).toBe('JHN');
    });

    it('should return null for invalid queries', () => {
        expect(parseQuery('')).toBeNull();
        expect(parseQuery('hello')).toBeNull();
        expect(parseQuery('xyz 1 1')).toBeNull();
    });

    it('should parse numbered books', () => {
        const result = parseQuery('1кор 13 4');
        expect(result).not.toBeNull();
        expect(result.canonicalCode).toBe('1CO');
        expect(result.chapter).toBe('13');
    });
});

describe('fetchVerse', () => {
    it('should fetch a single verse with translation param', () => {
        const parsed = parseQuery('ин 3 16');
        const result = fetchVerse(parsed, mockDatabase, 'RST');

        expect(result).not.toBeNull();
        expect(result.text).toContain('возлюбил Бог');
        expect(result.reference).toBe('От Иоанна 3:16');
        expect(result.canonicalCode).toBe('JHN');
    });

    it('should fetch verse range', () => {
        const parsed = parseQuery('быт 1 1-3');
        const result = fetchVerse(parsed, mockDatabase, 'RST');

        expect(result).not.toBeNull();
        expect(result.text).toContain('В начале');
        expect(result.text).toContain('да будет свет');
    });

    it('should return null for non-existent verse', () => {
        const parsed = { canonicalCode: 'REV', chapter: '1', verse: '1' };
        const result = fetchVerse(parsed, mockDatabase, 'RST');

        expect(result).toBeNull();
    });

    it('should return null when database is empty', () => {
        const parsed = parseQuery('ин 3 16');
        const result = fetchVerse(parsed, null, 'RST');

        expect(result).toBeNull();
    });
});

describe('fullTextSearch', () => {
    it('should find verses containing search term', () => {
        const results = fullTextSearch('возлюбил', mockDatabase, 'RST');

        expect(results.length).toBeGreaterThan(0);
        expect(results[0].text).toContain('возлюбил');
    });

    it('should be case insensitive', () => {
        const results = fullTextSearch('БОГ', mockDatabase, 'RST');

        expect(results.length).toBeGreaterThan(0);
    });

    it('should return empty array for no matches', () => {
        const results = fullTextSearch('xyznonexistent', mockDatabase, 'RST');

        expect(results).toEqual([]);
    });

    it('should respect limit parameter', () => {
        const results = fullTextSearch('Бог', mockDatabase, 'RST', 2);

        expect(results.length).toBeLessThanOrEqual(2);
    });

    it('should return empty for empty query', () => {
        const results = fullTextSearch('', mockDatabase, 'RST');

        expect(results).toEqual([]);
    });
});
