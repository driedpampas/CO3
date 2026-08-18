const InAppBrowser = {
    open: async (url) => {
        if (typeof window !== 'undefined') {
            window.open(url, '_blank');
        }
        return { type: 'opened' };
    },
    close: async () => {},
    isAvailable: async () => true,
};

export default InAppBrowser;
export { InAppBrowser };
