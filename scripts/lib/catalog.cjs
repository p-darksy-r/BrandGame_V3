const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const icons = Object.values(require('simple-icons'));
const categories = ['tech', 'auto', 'food', 'fashion', 'media'];
const normalize = value => value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
const byTitle = new Map(icons.map(icon => [normalize(icon.title), icon]));
const bySlug = new Map(icons.map(icon => [icon.slug, icon]));
// These are alternative names for the same identity, never a parent-company logo.
const aliases = {
    'NodeJS': 'nodedotjs', 'Vue': 'vuedotjs', 'Nuxt': 'nuxtdotjs', 'Rollup': 'rollupdotjs',
    'S3': 'amazons3', 'DynamoDB': 'amazondynamodb', 'Azure': 'microsoftazure',
    'Apollo': 'apollographql', 'Plausible': 'plausibleanalytics', 'Apache HTTP': 'apache',
    'Hyper terminal': 'hyper', 'Elementary OS': 'elementary', 'Tails OS': 'tails',
    'Gentoo Linux': 'gentoo', 'Proxmox VE': 'proxmox', 'Drone CI': 'drone', 'FaunaDB': 'fauna',
    'Electronic Arts': 'ea', 'Pandora Radio': 'pandora', 'TED Talks': 'ted'
};
const exclusions = {
    'auto:Norton': 'O ícone corresponde ao antivírus, não à marca de motociclos.',
    'auto:Proton': 'O ícone corresponde ao serviço de email, não à marca automóvel.',
    'fashion:Pandora': 'O ícone corresponde ao serviço de música, não à joalharia.',
    'fashion:Element': 'O ícone corresponde ao mensageiro, não à marca de roupa.',
    'food:Monster': 'O ícone corresponde ao portal de emprego, não à bebida.'
};
const hints = {
    'Elastic': 'Search and observability platform with a multicoloured symbol.',
    'Turbo': 'Build system with a circular red and blue symbol.',
    'Lambda': 'Serverless functions billed by execution.',
    'Bugatti': 'French hypercars with a red oval badge.',
    'F1': 'International single-seater motor racing championship.',
    'Zsh': 'Interactive command interpreter with powerful completion.'
};

function auditCatalog(root) {
    const catalog = {}, excluded = [], corrected = [], selectedIcons = new Map();
    for (const category of categories) {
        const context = vm.createContext({});
        vm.runInContext(fs.readFileSync(path.join(root, `src/web/js/data/${category}.js`), 'utf8') +
            `;this.rows=RAW_BRANDS_${category.toUpperCase()};`, context);
        const seenNames = new Set(), seenIcons = new Set();
        catalog[category] = [];
        for (const row of context.rows) {
            const [name, oldSlug, oldHint] = row.split('|');
            if (!name || !oldSlug || !oldHint) throw new Error(`Invalid catalog row: ${row}`);
            const key = normalize(name);
            if (seenNames.has(key)) continue;
            seenNames.add(key);
            const icon = byTitle.get(key) || bySlug.get(aliases[name]);
            const reason = exclusions[`${category}:${name}`] || (!icon ? 'Sem ícone correspondente verificado no pacote fixado.' :
                seenIcons.has(icon.slug) ? 'Identidade já representada nesta categoria.' : null);
            if (reason) { excluded.push({ category, name, oldSlug, reason }); continue; }
            seenIcons.add(icon.slug);
            const hint = hints[name] || oldHint;
            catalog[category].push({ name, slug: icon.slug, hint });
            selectedIcons.set(icon.slug, icon);
            if (icon.slug !== oldSlug || hint !== oldHint) corrected.push({ category, name, oldSlug, slug: icon.slug, hint });
        }
        if (catalog[category].length < 12) throw new Error(`Not enough verified brands in ${category}.`);
    }
    return { catalog, excluded, corrected, selectedIcons };
}
module.exports = { auditCatalog, categories };
