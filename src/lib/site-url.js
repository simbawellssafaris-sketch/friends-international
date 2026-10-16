// The one official address of the website. Sitemap and robots.txt use it, so search engines are always pointed at the same domain
// (no "www.", always https). It is fixed here on purpose rather than read from an environment variable, so a wrong setting
// (for example a localhost address) can never end up in the sitemap.
export const SITE_URL = "https://friendsinternationallimited.com";
