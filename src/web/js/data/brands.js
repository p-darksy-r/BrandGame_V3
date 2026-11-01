/* BrandGame_V3 - Copyright (c) darksy */

// Category source files retain the editable compact Name|Slug|Hint format.
// Normalize once; duplicate brand names must not appear twice in one round.
const RAW_COMPACT_POOLS = {
    tech: RAW_BRANDS_TECH,
    auto: RAW_BRANDS_AUTO,
    food: RAW_BRANDS_FOOD,
    fashion: RAW_BRANDS_FASHION,
    media: RAW_BRANDS_MEDIA
};

const BRAND_DATABASE = Object.freeze(Object.fromEntries(
    Object.entries(RAW_COMPACT_POOLS).map(([category, items]) => {
        const unique = new Map();
        for (const item of items) {
            const [name, slug, hint] = item.split('|');
            if (!name || !slug || !hint) throw new Error(`Invalid brand in ${category}: ${item}`);
            const key = name.trim().toLowerCase();
            if (!unique.has(key)) unique.set(key, Object.freeze({ name, slug, hint }));
        }
        return [category, Object.freeze([...unique.values()])];
    })
));

window.BRAND_DATABASE = BRAND_DATABASE;
