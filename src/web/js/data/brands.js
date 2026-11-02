// Only brands with a verified, bundled logo can be selected for a round.
const BRAND_DATABASE = Object.freeze(Object.fromEntries(Object.entries(OFFLINE_CATALOG).map(
    ([category, brands]) => [category, Object.freeze(brands.map(brand => Object.freeze(brand)))]
)));
const LOCAL_LOGO_SLUGS = new Set(Object.values(BRAND_DATABASE).flat().map(brand => brand.slug));
function getLocalLogoPath(slug) {
    return LOCAL_LOGO_SLUGS.has(slug) ? `assets/logos/${slug}.svg` : null;
}
window.BRAND_DATABASE = BRAND_DATABASE;
