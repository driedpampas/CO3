import ky from 'ky';
import getUrl from '../requestManager';

const DomParser = require('react-native-html-parser').DOMParser;

export async function fetchLoginAuthenticityToken() {
    try {
        let html = await ky.get('https://archiveofourown.org/users/login').text();
        html = html.replace('<br \\>', '');
        if (
            html.includes('You are already logged in to an account. Please log out and try again.')
        ) {
            throw new Error('Already logged in.');
        }
        const doc = new DomParser().parseFromString(html, 'text/html');
        const form = doc.getElementById('new_user');
        if (!form?.childNodes?.[0]) {
            throw new Error('Could not find login form authenticity token');
        }
        return form.childNodes[0].getAttribute('value');
    } catch (e) {
        console.error('Failed to fetch login authenticity token:', e?.message || e);
        throw e;
    }
}

export async function fetchKudoAuthenticityToken(workId) {
    try {
        let html = await getUrl(`https://archiveofourown.org/works/${workId}`);
        html = html.replace('<br \\>', '');

        const doc = new DomParser().parseFromString(html, 'text/html');
        const kudoForm = doc.getElementById('new_kudo');

        if (!kudoForm) {
            throw new Error('Kudo form not found on the page');
        }

        const tokenInput = kudoForm.childNodes[0];

        if (!tokenInput) {
            throw new Error('Authenticity token not found in kudo form');
        }

        return tokenInput.getAttribute('value');
    } catch (e) {
        console.error(`Failed to fetch kudo token for work ${workId}:`, e?.message || e);
        throw e;
    }
}
