/**
 * Tests for history.js module
 * Tests history management with XSS-safe DOM manipulation
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
    getHistory,
    addToHistory,
    getFromHistory,
    clearHistory,
    renderHistory
} from '../js/modules/history.js';

describe('History Module', () => {
    beforeEach(() => {
        // Clear history before each test
        clearHistory();
    });

    describe('addToHistory', () => {
        it('should add a verse to history', () => {
            const verse = { reference: 'Ин 3:16', text: 'Ибо так возлюбил Бог мир...' };
            const result = addToHistory(verse);

            expect(result).toBe(true);
            expect(getHistory().length).toBe(1);
            expect(getHistory()[0].reference).toBe('Ин 3:16');
        });

        it('should add new verses at the beginning', () => {
            addToHistory({ reference: 'Быт 1:1', text: 'В начале...' });
            addToHistory({ reference: 'Ин 3:16', text: 'Ибо так...' });

            expect(getHistory()[0].reference).toBe('Ин 3:16');
            expect(getHistory()[1].reference).toBe('Быт 1:1');
        });

        it('should not add duplicate at top', () => {
            addToHistory({ reference: 'Ин 3:16', text: 'Ибо так...' });
            const result = addToHistory({ reference: 'Ин 3:16', text: 'Ибо так...' });

            expect(result).toBe(false);
            expect(getHistory().length).toBe(1);
        });

        it('should limit history size', () => {
            // Add 20 items (should only keep 15)
            for (let i = 0; i < 20; i++) {
                addToHistory({ reference: `Ref ${i}`, text: `Text ${i}` });
            }

            expect(getHistory().length).toBeLessThanOrEqual(15);
        });
    });

    describe('getFromHistory', () => {
        it('should return verse at specified index', () => {
            addToHistory({ reference: 'Быт 1:1', text: 'В начале...' });
            addToHistory({ reference: 'Ин 3:16', text: 'Ибо так...' });

            const verse = getFromHistory(0);
            expect(verse.reference).toBe('Ин 3:16');
        });

        it('should return null for invalid index', () => {
            addToHistory({ reference: 'Ин 3:16', text: 'Ибо так...' });

            expect(getFromHistory(99)).toBeNull();
        });
    });

    describe('clearHistory', () => {
        it('should remove all history items', () => {
            addToHistory({ reference: 'Ин 3:16', text: 'Ибо так...' });
            addToHistory({ reference: 'Быт 1:1', text: 'В начале...' });

            clearHistory();

            expect(getHistory().length).toBe(0);
        });
    });

    describe('renderHistory (XSS safety)', () => {
        it('should render history items to container', () => {
            // Create mock container
            const container = document.createElement('div');

            addToHistory({ reference: 'Ин 3:16', text: 'Ибо так возлюбил Бог мир...' });
            addToHistory({ reference: 'Быт 1:1', text: 'В начале сотворил Бог...' });

            const mockCallback = vi.fn();
            renderHistory(container, mockCallback);

            expect(container.children.length).toBe(2);
            expect(container.querySelector('.history-ref').textContent).toBe('Быт 1:1');
        });

        it('should escape HTML in references (XSS prevention)', () => {
            const container = document.createElement('div');

            // Try to inject malicious HTML
            addToHistory({
                reference: '<script>alert("xss")</script>',
                text: 'Test text'
            });

            renderHistory(container, () => { });

            // Should be escaped, not executed
            const refEl = container.querySelector('.history-ref');
            expect(refEl.textContent).toBe('<script>alert("xss")</script>');
            expect(refEl.innerHTML).not.toContain('<script>');
        });

        it('should escape HTML in text snippets (XSS prevention)', () => {
            const container = document.createElement('div');

            // Try to inject malicious HTML
            addToHistory({
                reference: 'Test',
                text: '<img src=x onerror=alert(1)>Malicious'
            });

            renderHistory(container, () => { });

            // Should be escaped, not executed
            const snippetEl = container.querySelector('.history-snippet');
            expect(snippetEl.innerHTML).not.toContain('<img');
        });

        it('should setup click delegation', () => {
            const container = document.createElement('div');
            const mockCallback = vi.fn();

            addToHistory({ reference: 'Ин 3:16', text: 'Test' });
            renderHistory(container, mockCallback);

            // Simulate click on history item
            const item = container.querySelector('.history-item');
            item.click();

            expect(mockCallback).toHaveBeenCalledWith(0);
        });
    });
});
