export const getFlagEmoji = iso => {
    if (!iso || typeof iso !== 'string') return '🌐';
    try {
        return iso
            .toUpperCase()
            .replace(/./g, char => String.fromCodePoint(char.charCodeAt(0) + 127397));
    } catch {
        return '🌐';
    }
};
