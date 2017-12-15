var ontrack = require('./ontrack');
export default function ChromeShim (version, API) {
    API = ontrack(version, API);
}