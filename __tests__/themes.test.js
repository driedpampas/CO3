import {
    DEFAULT_THEME_COLOR,
    PRESET_THEME_COLORS,
    getThemeWithColor,
    themes,
} from '../main/utils/themes';

describe('Themes and custom color utility', () => {
    test('default primary color is #990001', () => {
        expect(DEFAULT_THEME_COLOR).toBe('#990001');
        expect(themes.light.primaryColor).toBe('#990001');
        expect(themes.dark.primaryColor).toBe('#990001');
        expect(themes.black.primaryColor).toBe('#990001');
    });

    test('preset theme colors contains AO3 Red as first preset', () => {
        expect(PRESET_THEME_COLORS.length).toBeGreaterThan(0);
        expect(PRESET_THEME_COLORS[0]).toEqual({
            name: 'AO3 Red',
            color: '#990001',
        });
    });

    test('getThemeWithColor returns default theme color when customColor is null', () => {
        const theme = getThemeWithColor('light', null);
        expect(theme.primaryColor).toBe('#990001');
        expect(theme.statusBadge.started).toBe('#990001');
    });

    test('getThemeWithColor applies customColor override properly', () => {
        const theme = getThemeWithColor('dark', '#3b82f6');
        expect(theme.primaryColor).toBe('#3b82f6');
        expect(theme.statusBadge.started).toBe('#3b82f6');
    });
});
