module.exports = {
    content: ['./src/web/index.html', './src/web/js/**/*.js'],
    // Category colour names are assembled by the card/menu renderers.
    safelist: [{ pattern: /^(bg|text|border)-(blue|red|yellow|pink|purple|indigo|emerald|green|orange|cyan)-(300|400|500|600|700|800|900|950)$/, variants: ['hover'] }],
    theme: { extend: {} },
    plugins: []
};
