describe('Chapter parsing and formatting tests', () => {
    function parseChapters(chapterText) {
        if (!chapterText) return { current: null, total: null };

        const match = chapterText.match(/(\d+)\/(\d+|\?)/);
        if (match) {
            return {
                current: parseInt(match[1], 10),
                total: match[2] === '?' ? null : parseInt(match[2], 10),
            };
        }
        return { current: null, total: null };
    }

    function formatChapterDisplay(currentChapter, chapterCount) {
        return `${currentChapter || 1}/${chapterCount || '?'}`;
    }

    test('parses unknown total chapters correctly (6/?)', () => {
        const info = parseChapters('6/?');
        expect(info).toEqual({ current: 6, total: null });
        expect(formatChapterDisplay(info.current, info.total)).toBe('6/?');
    });

    test('parses unknown total chapters correctly (41/?)', () => {
        const info = parseChapters('41/?');
        expect(info).toEqual({ current: 41, total: null });
        expect(formatChapterDisplay(info.current, info.total)).toBe('41/?');
    });

    test('parses completed single chapter (1/1)', () => {
        const info = parseChapters('1/1');
        expect(info).toEqual({ current: 1, total: 1 });
        expect(formatChapterDisplay(info.current, info.total)).toBe('1/1');
    });

    test('parses completed multi chapter (10/10)', () => {
        const info = parseChapters('10/10');
        expect(info).toEqual({ current: 10, total: 10 });
        expect(formatChapterDisplay(info.current, info.total)).toBe('10/10');
    });

    test('parses in-progress multi chapter with known total (3/10)', () => {
        const info = parseChapters('3/10');
        expect(info).toEqual({ current: 3, total: 10 });
        expect(formatChapterDisplay(info.current, info.total)).toBe('3/10');
    });

    test('handles missing or null chapter string gracefully', () => {
        const info = parseChapters(null);
        expect(info).toEqual({ current: null, total: null });
        expect(formatChapterDisplay(info.current, info.total)).toBe('1/?');
    });
});
