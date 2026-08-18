const flagContext =
    typeof require.context === 'function'
        ? require.context('../res/flags-png-hd', false, /\.png$/)
        : null;

export const getFlagImage = iso => {
    try {
        return flagContext ? flagContext(`./${iso}.png`) : null;
    } catch {
        return null; // no flag for this code
    }
};
