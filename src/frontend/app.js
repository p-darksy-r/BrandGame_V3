/* BrandGame_V3 - https://github.com/darksy2027-ctrl/BrandGame_V3 - Copyright (c) darksy */

// --- AUDIO SYNTH ENGINE ---
class RetroAudioSynth {
    constructor() {
        this.ctx = null;
        this.volume = 0.5;
    }
    init() {
        if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    playCoin() {
        this.init(); if (this.volume === 0) return;
        const now = this.ctx.currentTime, osc = this.ctx.createOscillator(), gain = this.ctx.createGain();
        osc.connect(gain); gain.connect(this.ctx.destination);
        osc.type = 'sine'; gain.gain.setValueAtTime(this.volume * 0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
        osc.frequency.setValueAtTime(587.33, now); osc.frequency.setValueAtTime(880, now + 0.1);
        osc.start(now); osc.stop(now + 0.3);
    }
    playWrong() {
        this.init(); if (this.volume === 0) return;
        const now = this.ctx.currentTime, osc = this.ctx.createOscillator(), gain = this.ctx.createGain();
        osc.connect(gain); gain.connect(this.ctx.destination);
        osc.type = 'sawtooth'; gain.gain.setValueAtTime(this.volume * 0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
        osc.frequency.setValueAtTime(150, now); osc.frequency.linearRampToValueAtTime(75, now + 0.4);
        osc.start(now); osc.stop(now + 0.4);
    }
    playFanfare() {
        this.init(); if (this.volume === 0) return;
        const now = this.ctx.currentTime, osc = this.ctx.createOscillator(), gain = this.ctx.createGain();
        osc.connect(gain); gain.connect(this.ctx.destination);
        osc.type = 'triangle'; gain.gain.setValueAtTime(this.volume * 0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);
        osc.frequency.setValueAtTime(523.25, now); osc.frequency.setValueAtTime(659.25, now + 0.1);
        osc.frequency.setValueAtTime(783.99, now + 0.2); osc.frequency.setValueAtTime(1046.5, now + 0.3);
        osc.start(now); osc.stop(now + 0.6);
    }
}

const sfx = new RetroAudioSynth();
const GAME_VERSION = "3.0.0";

// --- MASTER DYNAMIC BRAND DATABASE (125 BRANDS) ---
const BRAND_DATABASE = {
    tech: [
        { name: "Google", slug: "google", hint: "The world's largest search engine." },
        { name: "Apple", slug: "apple", hint: "Known for iPhones, iPads, and Mac computers." },
        { name: "Microsoft", slug: "microsoft", hint: "Creator of the Windows Operating System." },
        { name: "GitHub", slug: "github", hint: "The home for git repositories and open source." },
        { name: "Amazon", slug: "amazon", hint: "E-commerce giant and cloud services pioneer." },
        { name: "Meta", slug: "meta", hint: "Parent company of Facebook, Instagram, and WhatsApp." },
        { name: "Intel", slug: "intel", hint: "Leading manufacturer of x86 microprocessors." },
        { name: "AMD", slug: "amd", hint: "Makers of Ryzen processors and Radeon graphics cards." },
        { name: "NVIDIA", slug: "nvidia", hint: "Famous for GeForce graphics cards and AI computing." },
        { name: "Discord", slug: "discord", hint: "Voice, video, and text communication platform for gamers." },
        { name: "Slack", slug: "slack", hint: "Channel-based business messaging platform." },
        { name: "Spotify", slug: "spotify", hint: "Green circular icon music streaming giant." },
        { name: "Steam", slug: "steam", hint: "Valve's massive PC gaming distribution platform." },
        { name: "Nintendo", slug: "nintendo", hint: "Gaming giant behind Mario, Zelda, and the Switch." },
        { name: "PlayStation", slug: "playstation", hint: "Sony's iconic home gaming console brand." },
        { name: "Xbox", slug: "xbox", hint: "Microsoft's competitive home gaming console brand." },
        { name: "Linux", slug: "linux", hint: "Iconic open-source kernel represented by Tux the penguin." },
        { name: "Raspberry Pi", slug: "raspberrypi", hint: "Ultra-affordable single-board computers." },
        { name: "Android", slug: "android", hint: "Google's open-source mobile operating system." },
        { name: "Zoom", slug: "zoom", hint: "Video conferencing platform that surged in 2020." },
        { name: "Samsung", slug: "samsung", hint: "Korean tech giant famous for Galaxy devices." },
        { name: "Sony", slug: "sony", hint: "Japanese conglomerate behind Walkman and TVs." },
        { name: "Adobe", slug: "adobe", hint: "Creative software suite featuring Photoshop." },
        { name: "Figma", slug: "figma", hint: "Collaborative vector design and prototyping tool." },
        { name: "Cloudflare", slug: "cloudflare", hint: "Web infrastructure and security provider with an orange cloud logo." }
    ],
    auto: [
        { name: "Tesla", slug: "tesla", hint: "Electric vehicle giant founded by Elon Musk." },
        { name: "Ford", slug: "ford", hint: "Classic American automaker founded in Detroit." },
        { name: "Ferrari", slug: "ferrari", hint: "Prestigious red Italian luxury sports cars." },
        { name: "Porsche", slug: "porsche", hint: "German luxury sports car maker famous for the 911." },
        { name: "BMW", slug: "bmw", hint: "Bavarian Motor Works, blue and white circular logo." },
        { name: "Mercedes-Benz", slug: "mercedesbenz", hint: "German luxury manufacturer with a 3-pointed star." },
        { name: "Audi", slug: "audi", hint: "German brand symbolized by four interlocking rings." },
        { name: "Volkswagen", slug: "volkswagen", hint: "German automaker whose name translates to 'People's Car'." },
        { name: "Toyota", slug: "toyota", hint: "Japanese giant known for reliability and the Prius hybrid." },
        { name: "Honda", slug: "honda", hint: "Japanese brand famous for Civics and motorcycles." },
        { name: "Nissan", slug: "nissan", hint: "Japanese brand behind the GT-R and Leaf EV." },
        { name: "Hyundai", slug: "hyundai", hint: "South Korean manufacturer with a slanted 'H' logo." },
        { name: "Chevrolet", slug: "chevrolet", hint: "American brand with the iconic gold bowtie logo." },
        { name: "Jeep", slug: "jeep", hint: "Rugged American brand famous for off-road SUVs." },
        { name: "Dodge", slug: "dodge", hint: "American muscle brand behind the Charger and Challenger." },
        { name: "Lamborghini", slug: "lamborghini", hint: "Exotic Italian supercars with a charging bull logo." },
        { name: "Aston Martin", slug: "astonmartin", hint: "British luxury brand famous as James Bond's ride." },
        { name: "Bentley", slug: "bentley", hint: "Ultra-luxury British manufacturer with a winged 'B' logo." },
        { name: "Jaguar", slug: "jaguar", hint: "British luxury brand with a leaping wildcat logo." },
        { name: "Subaru", slug: "subaru", hint: "Japanese brand known for symmetrical AWD." },
        { name: "Mazda", slug: "mazda", hint: "Japanese brand famous for the MX-5 Miata and rotary engines." },
        { name: "Lexus", slug: "lexus", hint: "Toyota's luxury vehicle division." },
        { name: "Volvo", slug: "volvo", hint: "Swedish manufacturer globally famous for passenger safety." },
        { name: "McLaren", slug: "mclaren", hint: "British supercar manufacturer with deep F1 racing roots." },
        { name: "Land Rover", slug: "landrover", hint: "British all-terrain luxury SUV brand." }
    ],
    food: [
        { name: "Coca-Cola", slug: "cocacola", hint: "Iconic carbonated cola soft drink." },
        { name: "McDonald's", slug: "mcdonalds", hint: "Fast food giant famous for Golden Arches." },
        { name: "Pepsi", slug: "pepsi", hint: "Classic blue & red circular soda brand." },
        { name: "Starbucks", slug: "starbucks", hint: "Seattle-born coffee house with a green siren." },
        { name: "Burger King", slug: "burgerking", hint: "Home of the flame-broiled Whopper." },
        { name: "Subway", slug: "subway", hint: "Green and yellow sandwich chain famous for footlongs." },
        { name: "Domino's", slug: "dominos", hint: "World's largest pizza delivery chain represented by a domino tile." },
        { name: "KFC", slug: "kfc", hint: "Kentucky Fried Chicken, founded by Colonel Sanders." },
        { name: "Nestle", slug: "nestle", hint: "Swiss food and beverage giant with a bird's nest logo." },
        { name: "Heineken", slug: "heineken", hint: "Dutch pale lager in a green bottle with a red star." },
        { name: "Red Bull", slug: "redbull", hint: "Energy drink that 'gives you wings'." },
        { name: "Monster Energy", slug: "monsterenergy", hint: "Black energy drink can with a green claw-mark logo." },
        { name: "Nutella", slug: "nutella", hint: "Famous cocoa-hazelnut spread." },
        { name: "Oreo", slug: "oreo", hint: "World's best-selling cream-filled sandwich cookie." },
        { name: "Kellogg's", slug: "kelloggs", hint: "American cereal multinational behind Frosted Flakes." },
        { name: "Lay's", slug: "lays", hint: "Popular thin potato chip brand." },
        { name: "Doritos", slug: "doritos", hint: "Flavored tortilla chips with a distinct triangular design." },
        { name: "Taco Bell", slug: "tacobell", hint: "Mexican-inspired fast-food chain with a purple bell logo." },
        { name: "Pizza Hut", slug: "pizzahut", hint: "Classic red-roofed pan pizza parlor chain." },
        { name: "Pringles", slug: "pringles", hint: "Stackable potato crisps in a tube with a mustached mascot." },
        { name: "Budweiser", slug: "budweiser", hint: "American lager styled as the 'King of Beers'." },
        { name: "Sprite", slug: "sprite", hint: "Lemon-lime flavored caffeine-free soft drink." },
        { name: "Fanta", slug: "fanta", hint: "Fruit-flavored carbonated soft drink line." },
        { name: "Heinz", slug: "heinz", hint: "Famous for its '57 Varieties' of ketchup." },
        { name: "Guinness", slug: "guinness", hint: "Dark Irish dry stout with an iconic gold harp logo." }
    ],
    fashion: [
        { name: "Nike", slug: "nike", hint: "Athletic apparel brand with a famous 'Swoosh' logo." },
        { name: "Adidas", slug: "adidas", hint: "Famous German three-stripes sports brand." },
        { name: "Gucci", slug: "gucci", hint: "High-end luxury Italian fashion designer with double 'G's." },
        { name: "Louis Vuitton", slug: "louisvuitton", hint: "French luxury house renowned for LV monogram trunks." },
        { name: "Chanel", slug: "chanel", hint: "French fashion house behind interlocking 'C's." },
        { name: "Dior", slug: "dior", hint: "Prestigious French luxury goods company founded by Christian." },
        { name: "Hermes", slug: "hermes", hint: "Ultra-exclusive French luxury brand famous for Birkin bags." },
        { name: "Prada", slug: "prada", hint: "Italian luxury fashion house founded by Mario Prada." },
        { name: "Rolex", slug: "rolex", hint: "Premier Swiss watchmaker symbolized by a golden crown." },
        { name: "Puma", slug: "puma", hint: "German sportswear brand with a leaping cat emblem." },
        { name: "Under Armour", slug: "underarmour", hint: "American sports equipment brand with interlocking 'U' and 'A'." },
        { name: "Supreme", slug: "supreme", hint: "Streetwear brand famous for its red box logo." },
        { name: "Calvin Klein", slug: "calvinklein", hint: "American fashion house known for minimalist underwear." },
        { name: "Tommy Hilfiger", slug: "tommyhilfiger", hint: "American brand with a blue, red, and white flag block logo." },
        { name: "Levi's", slug: "levis", hint: "American clothing company pioneer of blue denim jeans." },
        { name: "Zara", slug: "zara", hint: "Spanish fast-fashion powerhouse." },
        { name: "H&M", slug: "hm", hint: "Swedish multinational fast-fashion retailer." },
        { name: "Versace", slug: "versace", hint: "Italian luxury brand featuring a Medusa head logo." },
        { name: "Armani", slug: "armani", hint: "Italian luxury fashion house founded by Giorgio." },
        { name: "Burberry", slug: "burberry", hint: "British luxury brand famous for trench coats and tartan." },
        { name: "Cartier", slug: "cartier", hint: "French luxury watch and jewelry conglomerate." },
        { name: "Tiffany & Co.", slug: "tiffanyandco", hint: "American luxury jeweler famous for its robin's egg blue boxes." },
        { name: "Oakley", slug: "oakley", hint: "American sports performance equipment and stylish eyewear." },
        { name: "Ray-Ban", slug: "rayban", hint: "American-Italian brand behind Wayfarer and Aviator sunglasses." },
        { name: "Vans", slug: "vans", hint: "American manufacturer of skateboarding shoes." }
    ],
    media: [
        { name: "YouTube", slug: "youtube", hint: "Red play-button video-sharing giant." },
        { name: "Netflix", slug: "netflix", hint: "Global movie streaming network with red branding." },
        { name: "Spotify", slug: "spotify", hint: "Green music and podcast streaming service." },
        { name: "TikTok", slug: "tiktok", hint: "Short-form mobile video platform with a cyan/magenta note." },
        { name: "Instagram", slug: "instagram", hint: "Meta-owned photo and video sharing network." },
        { name: "Facebook", slug: "facebook", hint: "The social network founded by Mark Zuckerberg." },
        { name: "X", slug: "twitter", hint: "The bird app microblogging platform rebranded as X." },
        { name: "Reddit", slug: "reddit", hint: "The 'front page of the internet' with an orange alien mascot." },
        { name: "Twitch", slug: "twitch", hint: "Amazon-owned live streaming service for gamers." },
        { name: "Pinterest", slug: "pinterest", hint: "Image sharing and social media service for pinboard inspiration." },
        { name: "Snapchat", slug: "snapchat", hint: "Multimedia messaging app represented by a yellow ghost logo." },
        { name: "LinkedIn", slug: "linkedin", hint: "Professional networking and job recruitment platform." },
        { name: "Disney", slug: "disney", hint: "Entertainment empire represented by Sleeping Beauty's castle." },
        { name: "Warner Bros.", slug: "warnerbros", hint: "Major film studio with a classic golden shield logo." },
        { name: "HBO", slug: "hbo", hint: "Home Box Office, premium television cable network." },
        { name: "Wikipedia", slug: "wikipedia", hint: "Free, open-collaborative online encyclopedia." },
        { name: "BBC", slug: "bbc", hint: "British public service broadcaster using three block letters." },
        { name: "CNN", slug: "cnn", hint: "American basic cable news channel with a red stencil logo." },
        { name: "The New York Times", slug: "nytimes", hint: "Historic American newspaper with blackletter typeface." },
        { name: "Paramount", slug: "paramount", hint: "Classic Hollywood studio with a mountain surrounded by stars." },
        { name: "Crunchyroll", slug: "crunchyroll", hint: "Global anime and manga distribution network." },
        { name: "Sega", slug: "sega", hint: "Japanese video game developer behind Sonic the Hedgehog." },
        { name: "Pixar", slug: "pixar", hint: "CGI animation studio represented by an active desk lamp." },
        { name: "Twilio", slug: "twilio", hint: "Cloud communications platform as a service." },
        { name: "Zoom", slug: "zoom", hint: "Cloud video conferencing software." }
    ]
};

// --- SEEDED DETERMINISTIC SELECTION ENGINE ---
function seededShuffle(array, seed) {
    let m = 0x80000000, a = 1103515245, c = 12345;
    let state = seed ? seed : Math.floor(Math.random() * (m - 1));
    function nextInt() {
        state = (a * state + c) % m;
        return state;
    }
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = nextInt() % (i + 1);
        const temp = shuffled[i];
        shuffled[i] = shuffled[j];
        shuffled[j] = temp;
    }
    return shuffled;
}

function getBrandsForLevel(category, level) {
    const pool = BRAND_DATABASE[category] || BRAND_DATABASE.tech;
    
    // Dynamic difficulty equation:
    // $$B = \lfloor \frac{L - 1}{10} \rfloor + 3$$
    // Brands to guess scales by +1 every 10 levels, starting at 3.
    const brandCount = Math.floor((level - 1) / 10) + 3;

    let hash = 0;
    for (let i = 0; i < category.length; i++) {
        hash = category.charCodeAt(i) + ((hash << 5) - hash);
    }
    const seed = Math.abs(hash + level);

    const shuffled = seededShuffle(pool, seed);
    const selected = [];

    for (let i = 0; i < brandCount; i++) {
        selected.push(shuffled[i % shuffled.length]);
    }

    return selected;
}

// --- GAME STATE SYSTEM ---
const GAME_STATE = {
    saveData: {
        gameVersion: GAME_VERSION,
        globalScore: 0,
        customScore: 0,
        categoryScores: { tech: 0, auto: 0, food: 0, fashion: 0, media: 0 },
        levelsUnlocked: { tech: 1, auto: 1, food: 1, fashion: 1, media: 1 },
        customLevels: [],
        difficulty: "medium",
        volume: 0.5,
        resolution: "1024x768",
        quality: "high",
        vibration: true,
        brightness: 100,
        fpsLimit: "uncapped",
        vsync: true
    },
    currentCategory: null,
    currentLevel: null,
    currentBrandIndex: 0,
    currentLevelCorrectCount: 0,
    currentLevelScore: 0,
    activeBrands: [],
    elapsedTime: 0,
    timerInterval: null,
    currentBrand: null,
    lives: 3,
    revealedIndices: [],
    levelSelectPage: 0
};

let gameLoopId = null;

// --- MASTER BOOTSTRAP INITIALIZATION ---
document.addEventListener("DOMContentLoaded", () => {
    const headerVer = document.getElementById("header-version-badge");
    if (headerVer) headerVer.textContent = `v${GAME_VERSION}`;
    const footerVer = document.getElementById("footer-version-text");
    if (footerVer) footerVer.textContent = GAME_VERSION;

    // Load configurations from either C# Webview Host or Fallback Browser Sandbox
    sendNativeRequest({ Action: "load_save" });
    setupEventHandlers();
    populatePageSelectDropdown();
    showScreen("screen-main-menu");
});

function sendNativeRequest(payload) {
    if (window.chrome && window.chrome.webview && window.chrome.webview.postMessage) {
        window.chrome.webview.postMessage(payload);
    } else {
        if (payload.Action === "load_save") {
            const raw = localStorage.getItem("brandgame_v3_savedata");
            if (raw) {
                try {
                    GAME_STATE.saveData = JSON.parse(raw);
                } catch (e) {
                    console.error("Failed to parse local save data:", e);
                }
            }
            if (GAME_STATE.saveData.gameVersion !== GAME_VERSION) {
                GAME_STATE.saveData.gameVersion = GAME_VERSION;
                sendNativeRequest({ Action: "write_save", Data: GAME_STATE.saveData });
            }
            onSaveLoaded(GAME_STATE.saveData);
        } else if (payload.Action === "write_save") {
            localStorage.setItem("brandgame_v3_savedata", JSON.stringify(payload.Data));
        }
    }
}

function onSaveLoaded(data) {
    if (data) {
        let parsedData = data;
        if (typeof data === "string") {
            try {
                parsedData = JSON.parse(data);
            } catch (e) {
                console.error("Failed to parse save state string data:", e);
                parsedData = {};
            }
        }
        GAME_STATE.saveData = { ...GAME_STATE.saveData, ...parsedData };
        if (!GAME_STATE.saveData.customLevels) GAME_STATE.saveData.customLevels = [];
    }
    
    // Sync UI elements after parameters have loaded!
    sfx.volume = GAME_STATE.saveData.volume;
    updateGlobalStatsHUD();
    renderMainMenuProgress();
    syncSettingsPanel();
    applyVisualSettings();
}
window.onSaveLoaded = onSaveLoaded;

function showScreen(screenId) {
    const screens = ["screen-main-menu", "screen-categories", "screen-levels", "screen-gameplay", "screen-report", "screen-settings", "screen-creator"];
    screens.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            if (id === screenId) el.classList.remove("hidden");
            else el.classList.add("hidden");
        }
    });
    
    if (screenId !== "screen-gameplay") {
        clearCustomThemeClasses();
    }

    const header = document.getElementById("header-stats");
    if (header) {
        if (screenId === "screen-main-menu" || screenId === "screen-categories") header.classList.remove("hidden");
        else header.classList.add("hidden");
    }
}

function clearCustomThemeClasses() {
    document.body.classList.remove("theme-cyber-neon", "theme-retro-amber", "theme-matrix-green", "theme-midnight-blue");
}

function updateGlobalStatsHUD() {
    let globalStars = 0;
    ["tech", "auto", "food", "fashion", "media"].forEach(cat => {
        const unlocked = GAME_STATE.saveData.levelsUnlocked[cat] || 1;
        globalStars += (unlocked - 1) * 2;
    });
    const customCount = GAME_STATE.saveData.customLevels.length;
    globalStars += customCount * 2;

    const starsEl = document.getElementById("global-stars");
    if (starsEl) starsEl.textContent = globalStars;
    const scoreEl = document.getElementById("global-score");
    if (scoreEl) scoreEl.textContent = GAME_STATE.saveData.globalScore + (GAME_STATE.saveData.customScore || 0);
}

function renderMainMenuProgress() {
    const catList = document.getElementById("category-summary-list");
    if (!catList) return;
    
    catList.innerHTML = "";
    const categories = [
        { id: "tech", label: "Technology" },
        { id: "auto", label: "Automotive" },
        { id: "food", label: "Food & Beverage" },
        { id: "fashion", label: "Fashion & Luxury" },
        { id: "media", label: "Media & Entertain" }
    ];
    categories.forEach(cat => {
        const score = GAME_STATE.saveData.categoryScores[cat.id] || 0;
        const unlocked = GAME_STATE.saveData.levelsUnlocked[cat.id] || 1;
        const percent = Math.min(((unlocked - 1) / 100) * 100, 100);

        const item = document.createElement("div");
        item.className = "space-y-1";
        item.innerHTML = `
            <div class="flex justify-between text-xs font-bold uppercase tracking-wide">
                <span class="text-gray-300">${cat.label}</span>
                <span class="text-blue-400">Score: ${score}</span>
            </div>
            <div class="w-full bg-gray-950 h-2 rounded-full overflow-hidden border border-gray-800 flex">
                <div class="bg-blue-600 h-full" style="width: ${percent}%"></div>
            </div>
            <div class="flex justify-between text-[10px] text-gray-500">
                <span>Progress: ${unlocked - 1}/100 Levels</span>
                <span>Max: Level ${unlocked}</span>
            </div>
        `;
        catList.appendChild(item);
    });

    const customScore = GAME_STATE.saveData.customScore || 0;
    const customCount = GAME_STATE.saveData.customLevels.length;
    const customItem = document.createElement("div");
    customItem.className = "space-y-1 pt-2 border-t border-gray-800/60";
    customItem.innerHTML = `
        <div class="flex justify-between text-xs font-bold uppercase tracking-wide text-emerald-400">
            <span>Custom Arenas</span>
            <span>Score: ${customScore}</span>
        </div>
        <div class="flex justify-between text-[10px] text-gray-500">
            <span>Created Level Rooms: ${customCount}</span>
        </div>
    `;
    catList.appendChild(customItem);
}

function populatePageSelectDropdown() {
    const sel = document.getElementById("select-level-page");
    if (!sel) return;
    sel.innerHTML = "";
    for (let i = 0; i < 10; i++) {
        const opt = document.createElement("option");
        opt.value = i;
        opt.textContent = `Levels ${i * 10 + 1} - ${i * 10 + 10}`;
        sel.appendChild(opt);
    }
    sel.addEventListener("change", (e) => {
        GAME_STATE.levelSelectPage = parseInt(e.target.value);
        renderLevelButtonsList();
    });
}

function safeAddEventListener(id, event, callback) {
    const el = document.getElementById(id);
    if (el) el.addEventListener(event, callback);
}

function setupEventHandlers() {
    safeAddEventListener("btn-menu-start", "click", () => {
        renderCategoryCards();
        showScreen("screen-categories");
    });
    
    safeAddEventListener("btn-menu-settings", "click", () => {
        syncSettingsPanel();
        showScreen("screen-settings");
    });
    
    safeAddEventListener("btn-menu-exit", "click", () => {
        if (confirm("Are you sure you want to close the game?")) {
            window.close();
        }
    });

    safeAddEventListener("btn-menu-reset", "click", () => {
        if (confirm("Permanently erase save progress and customized rooms?")) {
            GAME_STATE.saveData = {
                gameVersion: GAME_VERSION,
                globalScore: 0,
                customScore: 0,
                categoryScores: { tech: 0, auto: 0, food: 0, fashion: 0, media: 0 },
                levelsUnlocked: { tech: 1, auto: 1, food: 1, fashion: 1, media: 1 },
                customLevels: [],
                difficulty: "medium", volume: 0.5, resolution: "1024x768", quality: "high", vibration: true, brightness: 100, fpsLimit: "uncapped", vsync: true
            };
            sendNativeRequest({ Action: "write_save", Data: GAME_STATE.saveData });
            onSaveLoaded(GAME_STATE.saveData);
        }
    });

    safeAddEventListener("btn-categories-back", "click", () => showScreen("screen-main-menu"));
    safeAddEventListener("btn-levels-back", "click", () => showScreen("screen-categories"));
    safeAddEventListener("btn-settings-back", "click", () => showScreen("screen-main-menu"));
    safeAddEventListener("btn-creator-back", "click", () => showScreen("screen-categories"));

    safeAddEventListener("btn-gameplay-quit", "click", () => {
        clearInterval(GAME_STATE.timerInterval);
        if (GAME_STATE.currentCategory === "custom") {
            renderCategoryCards();
            showScreen("screen-categories");
        } else {
            showScreen("screen-levels");
        }
    });

    safeAddEventListener("btn-guess-submit", "click", submitUserGuess);
    
    const inputGuess = document.getElementById("input-guess");
    if (inputGuess) {
        inputGuess.addEventListener("keypress", (e) => {
            if (e.key === "Enter") submitUserGuess();
        });
    }

    safeAddEventListener("btn-gameplay-hint", "click", () => {
        const clueEl = document.getElementById("clue-text");
        if (clueEl) {
            clueEl.textContent = GAME_STATE.currentBrand.hint || "No clues available.";
            clueEl.classList.remove("hidden");
        }
        GAME_STATE.currentLevelScore = Math.max(GAME_STATE.currentLevelScore - 5, 0);
    });

    safeAddEventListener("btn-gameplay-reveal-char", "click", buyLetterClue);

    safeAddEventListener("btn-report-continue", "click", () => {
        if (GAME_STATE.currentCategory === "custom") {
            selectCustomCategory();
        } else {
            const catTitle = document.getElementById("level-category-title");
            selectCategory(GAME_STATE.currentCategory, catTitle ? catTitle.textContent : "");
        }
    });

    // Window Resolution Setup
    ["sm", "md", "lg"].forEach(sz => {
        const mapping = { sm: { w: 800, h: 600 }, md: { w: 1024, h: 768 }, lg: { w: 1280, h: 960 } };
        safeAddEventListener(`btn-win-${sz}`, "click", () => {
            GAME_STATE.saveData.resolution = `${mapping[sz].w}x${mapping[sz].h}`;
            updateResolutionButtons();
            applyWindowBounds();
            sendNativeRequest({ Action: "resize_window", Width: mapping[sz].w, Height: mapping[sz].h });
            sendNativeRequest({ Action: "write_save", Data: GAME_STATE.saveData });
        });
    });

    // Rendering Quality Toggles
    safeAddEventListener("btn-qual-low", "click", () => {
        GAME_STATE.saveData.quality = "low";
        applyVisualSettings();
        sendNativeRequest({ Action: "write_save", Data: GAME_STATE.saveData });
    });
    safeAddEventListener("btn-qual-high", "click", () => {
        GAME_STATE.saveData.quality = "high";
        applyVisualSettings();
        sendNativeRequest({ Action: "write_save", Data: GAME_STATE.saveData });
    });

    // FPS Limiter Config
    ["30", "60", "uncapped"].forEach(fps => {
        safeAddEventListener(`btn-fps-${fps}`, "click", () => {
            GAME_STATE.saveData.fpsLimit = fps;
            applyFrameBudgeting();
            sendNativeRequest({ Action: "write_save", Data: GAME_STATE.saveData });
        });
    });

    // Integrated Brightness Slider
    const briInput = document.getElementById("settings-brightness") || document.getElementById("brightness-slider");
    if (briInput) {
        briInput.addEventListener("input", (e) => {
            const val = e.target.value;
            GAME_STATE.saveData.brightness = parseInt(val);
            const lbl = document.getElementById("brightness-label") || document.getElementById("lbl-brightness");
            if (lbl) lbl.textContent = `${val}%`;
            applyVisualSettings();
        });
        briInput.addEventListener("change", () => {
            sendNativeRequest({ Action: "write_save", Data: GAME_STATE.saveData });
        });
    }

    // V-Sync Interface Toggles
    safeAddEventListener("btn-vsync-off", "click", () => {
        GAME_STATE.saveData.vsync = false;
        applyVSyncStatus();
        sendNativeRequest({ Action: "write_save", Data: GAME_STATE.saveData });
    });
    safeAddEventListener("btn-vsync-on", "click", () => {
        GAME_STATE.saveData.vsync = true;
        applyVSyncStatus();
        sendNativeRequest({ Action: "write_save", Data: GAME_STATE.saveData });
    });

    // Unified Vibration Trigger Hook
    const getVibElement = () => document.getElementById("btn-vibrate-toggle") || document.getElementById("vibration-toggle");
    const vibBtn = getVibElement();
    if (vibBtn) {
        vibBtn.addEventListener("click", () => {
            GAME_STATE.saveData.vibration = !GAME_STATE.saveData.vibration;
            updateVibrationButton();
            sendNativeRequest({ Action: "write_save", Data: GAME_STATE.saveData });
        });
    }

    safeAddEventListener("btn-settings-close", "click", () => {
        const volSlider = document.getElementById("settings-volume") || document.getElementById("volume-slider");
        if (volSlider) {
            GAME_STATE.saveData.volume = parseFloat(volSlider.value);
            sfx.volume = GAME_STATE.saveData.volume;
        }
        sendNativeRequest({ Action: "write_save", Data: GAME_STATE.saveData });
        showScreen("screen-main-menu");
    });

    // Master Volume Control Integration
    const volSlider = document.getElementById("settings-volume") || document.getElementById("volume-slider");
    if (volSlider) {
        volSlider.addEventListener("input", (e) => {
            const val = parseFloat(e.target.value);
            GAME_STATE.saveData.volume = val;
            sfx.volume = val;
            const lbl = document.getElementById("volume-label") || document.getElementById("lbl-volume");
            if (lbl) lbl.textContent = `${Math.round(val * 100)}%`;
        });
        volSlider.addEventListener("change", () => {
            sendNativeRequest({ Action: "write_save", Data: GAME_STATE.saveData });
        });
    }

    // Difficulty Select Buttons
    ["easy", "medium", "hard"].forEach(df => {
        safeAddEventListener(`diff-${df}`, "click", () => {
            GAME_STATE.saveData.difficulty = df;
            updateDifficultyToggles();
            sendNativeRequest({ Action: "write_save", Data: GAME_STATE.saveData });
        });
    });

    safeAddEventListener("btn-trigger-creator", "click", () => {
        const fields = {
            "creator-level-name": "",
            "creator-level-category": "tech",
            "creator-level-difficulty": "medium",
            "creator-level-theme": "cyber-neon",
            "creator-level-timer": "15"
        };
        for (const [id, value] of Object.entries(fields)) {
            const el = document.getElementById(id);
            if (el) el.value = value;
        }

        for (let i = 1; i <= 10; i++) {
            const nameEl = document.getElementById(`c-brand-${i}-name`);
            const slugEl = document.getElementById(`c-brand-${i}-slug`);
            const hintEl = document.getElementById(`c-brand-${i}-hint`);
            if (nameEl) nameEl.value = "";
            if (slugEl) slugEl.value = "";
            if (hintEl) hintEl.value = "";
        }
        showScreen("screen-creator");
    });

    safeAddEventListener("btn-save-custom-level", "click", publishCustomLevelRoom);
}

function buyLetterClue() {
    const name = GAME_STATE.currentBrand.name.replace(/[^a-zA-Z0-9]/g, "");
    if (GAME_STATE.revealedIndices.length >= name.length) return;

    const possible = [];
    for (let i = 0; i < name.length; i++) {
        if (!GAME_STATE.revealedIndices.includes(i)) possible.push(i);
    }

    if (possible.length > 0) {
        const rand = possible[Math.floor(Math.random() * possible.length)];
        GAME_STATE.revealedIndices.push(rand);
        renderRevealedLetters();
        GAME_STATE.currentLevelScore = Math.max(GAME_STATE.currentLevelScore - 10, 0);
    }
}

function renderRevealedLetters() {
    const brandName = GAME_STATE.currentBrand.name;
    const hud = document.getElementById("revealed-letters-hud");
    if (!hud) return;
    
    let displayStr = "";
    let cleanCharIndex = 0;

    for (let i = 0; i < brandName.length; i++) {
        const char = brandName[i];
        if (char === " " || char === "-" || char === "&" || char === ".") {
            displayStr += char + " ";
        } else {
            if (GAME_STATE.revealedIndices.includes(cleanCharIndex)) {
                displayStr += char.toUpperCase() + " ";
            } else {
                displayStr += "_ ";
            }
            cleanCharIndex++;
        }
    }
    hud.textContent = displayStr.trim();
}

function triggerVibration() {
    if (!GAME_STATE.saveData.vibration) return;
    const el = document.getElementById("screen-gameplay");
    if (el) {
        el.classList.add("shake-active");
        setTimeout(() => el.classList.remove("shake-active"), 400);
    }
}

// --- RENDERERS ---
function renderCategoryCards() {
    const grid = document.getElementById("category-cards-grid");
    if (!grid) return;
    grid.innerHTML = "";
    const categories = [
        { id: "tech", label: "Technology", desc: "Code and hardware masters.", bg: "from-blue-900 to-indigo-950" },
        { id: "auto", label: "Automotive", desc: "Supercar and speed engine marks.", bg: "from-red-950 to-orange-950" },
        { id: "food", label: "Food & Drink", desc: "Snack lines and beverage labels.", bg: "from-emerald-950 to-green-900" },
        { id: "fashion", label: "Fashion", desc: "Jewelry, styling and luxury icons.", bg: "from-pink-950 to-purple-950" },
        { id: "media", label: "Media & Fun", desc: "Entertainment, gaming, and logos.", bg: "from-amber-950 to-yellow-950" }
    ];
    
    categories.forEach(cat => {
        const unlocked = GAME_STATE.saveData.levelsUnlocked[cat.id] || 1;
        const totalScore = GAME_STATE.saveData.categoryScores[cat.id] || 0;
        const card = document.createElement("button");
        card.className = "flex flex-col text-left p-5 rounded-2xl border border-gray-800 bg-gradient-to-br " + cat.bg + " hover:border-gray-600 transition h-48 justify-between relative overflow-hidden group";
        card.innerHTML = `
            <div>
                <h3 class="gaming-font text-base font-bold tracking-wide">${cat.label}</h3>
                <p class="text-[10px] text-gray-400 mt-1 leading-normal">${cat.desc}</p>
            </div>
            <div class="z-10">
                <div class="text-[9px] uppercase font-bold text-gray-500">Accumulated score</div>
                <div class="text-xs font-bold text-white">${totalScore} Points</div>
            </div>
            <span class="absolute right-3 bottom-3 text-4xl font-black text-white/5 group-hover:text-white/10 transition">
                ${unlocked}/100
            </span>
        `;
        card.addEventListener("click", () => selectCategory(cat.id, cat.label));
        grid.appendChild(card);
    });

    const customCount = GAME_STATE.saveData.customLevels ? GAME_STATE.saveData.customLevels.length : 0;
    const customScore = GAME_STATE.saveData.customScore || 0;
    const customCard = document.createElement("button");
    customCard.className = "flex flex-col text-left p-5 rounded-2xl border border-dashed border-emerald-500/30 bg-gradient-to-br from-emerald-950/40 to-slate-950 hover:border-emerald-400 transition h-48 justify-between relative overflow-hidden group";
    customCard.innerHTML = `
        <div>
            <h3 class="gaming-font text-base font-bold tracking-wide text-emerald-400 flex items-center gap-1.5">
                <span>Custom Arena</span>
            </h3>
            <p class="text-[10px] text-gray-400 mt-1 leading-normal">Play community & custom made level designs.</p>
        </div>
        <div class="z-10">
            <div class="text-[9px] uppercase font-bold text-emerald-600">Total Custom Score</div>
            <div class="text-xs font-bold text-emerald-300">${customScore} CP</div>
        </div>
        <span class="absolute right-3 bottom-3 text-4xl font-black text-emerald-500/5 group-hover:text-emerald-500/10 transition">
            ${customCount} R
        </span>
    `;
    customCard.addEventListener("click", selectCustomCategory);
    grid.appendChild(customCard);
}

function selectCategory(catId, catLabel) {
    GAME_STATE.currentCategory = catId;
    GAME_STATE.levelSelectPage = 0;
    
    const catTitle = document.getElementById("level-category-title");
    if (catTitle) catTitle.textContent = catLabel;
    const catBadge = document.getElementById("level-category-badge");
    if (catBadge) catBadge.textContent = catLabel;
    
    const pageSelect = document.getElementById("select-level-page");
    if (pageSelect) {
        pageSelect.value = "0";
        if (pageSelect.parentElement) {
            pageSelect.parentElement.classList.remove("hidden");
        }
    }

    renderLevelButtonsList();
    showScreen("screen-levels");
}

function renderLevelButtonsList() {
    const grid = document.getElementById("level-buttons-grid");
    if (!grid) return;
    grid.innerHTML = "";
    
    const catId = GAME_STATE.currentCategory;
    const unlockedMax = GAME_STATE.saveData.levelsUnlocked[catId] || 1;
    
    grid.className = "grid grid-cols-5 gap-3 max-h-[360px] overflow-y-auto pr-2 custom-scrollbar";
    grid.style.maxHeight = "360px";
    grid.style.overflowY = "auto";
    grid.style.display = "grid";
    grid.style.gridTemplateColumns = "repeat(5, minmax(0, 1fr))";

    const startLevel = (GAME_STATE.levelSelectPage * 10) + 1;
    const endLevel = Math.min(startLevel + 9, 100);

    for (let i = startLevel; i <= endLevel; i++) {
        const isLocked = i > unlockedMax;
        const btn = document.createElement("button");
        
        if (isLocked) {
            btn.className = "flex flex-col items-center justify-center p-3 bg-gray-950/60 border border-gray-900 rounded-xl opacity-40 cursor-not-allowed aspect-square";
            btn.innerHTML = `<span class="text-gray-600 text-lg">🔒</span><span class="gaming-font text-[9px] font-bold text-gray-600 mt-1">LVL ${i}</span>`;
        } else {
            btn.className = "flex flex-col items-center justify-center p-3 bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-blue-500 rounded-xl transition group aspect-square";
            btn.innerHTML = `<span class="text-blue-400 text-sm group-hover:scale-110 transition">★</span><span class="gaming-font text-[10px] font-black text-white mt-1">LEVEL ${i}</span>`;
            btn.addEventListener("click", () => launchLevel(i));
        }
        grid.appendChild(btn);
    }
}

function selectCustomCategory() {
    GAME_STATE.currentCategory = "custom";
    
    const catTitle = document.getElementById("level-category-title");
    if (catTitle) catTitle.textContent = "Custom Arena Rooms";
    const catBadge = document.getElementById("level-category-badge");
    if (catBadge) catBadge.textContent = "CUSTOM";

    const parentSel = document.getElementById("select-level-page");
    if (parentSel && parentSel.parentElement) {
        parentSel.parentElement.classList.add("hidden");
    }

    const grid = document.getElementById("level-buttons-grid");
    if (!grid) return;
    grid.innerHTML = "";

    const list = GAME_STATE.saveData.customLevels || [];
    if (list.length === 0) {
        grid.className = "flex flex-col items-center justify-center col-span-5 py-12 text-center text-gray-500";
        grid.innerHTML = `
            <div class="text-4xl mb-2">☄</div>
            <p class="text-sm font-semibold uppercase tracking-wider">No Custom Levels Added</p>
            <p class="text-[11px] text-gray-600 mt-1 max-w-xs">Tap the '+ BUILD CUSTOM LEVEL' button in the header right corner to publish your first challenge playroom!</p>
        `;
        showScreen("screen-levels");
        return;
    }

    grid.className = "grid grid-cols-5 gap-3 max-h-[360px] overflow-y-auto pr-2 custom-scrollbar";
    grid.style.maxHeight = "360px";
    grid.style.overflowY = "auto";
    grid.style.display = "grid";
    grid.style.gridTemplateColumns = "repeat(5, minmax(0, 1fr))";

    list.forEach((room, index) => {
        const btn = document.createElement("button");
        btn.className = "flex flex-col items-center justify-center p-3 bg-gray-900 hover:bg-emerald-950/40 border border-gray-800 hover:border-emerald-500 rounded-xl transition group text-center aspect-square";
        btn.innerHTML = `
            <span class="text-emerald-400 text-base group-hover:scale-110 transition">☄</span>
            <span class="gaming-font text-[9px] font-black text-white mt-1 line-clamp-2 uppercase">${room.name}</span>
        `;
        btn.addEventListener("click", () => launchCustomLevel(index));
        grid.appendChild(btn);
    });
    showScreen("screen-levels");
}

function publishCustomLevelRoom() {
    const levelNameEl = document.getElementById("creator-level-name");
    const levelName = levelNameEl ? levelNameEl.value.trim() : "";

    if (!levelName) {
        alert("Please enter a custom name for your Level Room!");
        return;
    }

    const catEl = document.getElementById("creator-level-category");
    const category = catEl ? catEl.value : "tech";

    const diffEl = document.getElementById("creator-level-difficulty");
    const difficulty = diffEl ? diffEl.value : "medium";

    const themeEl = document.getElementById("creator-level-theme");
    const theme = themeEl ? themeEl.value : "cyber-neon";

    const timerEl = document.getElementById("creator-level-timer");
    const timer = timerEl ? (parseInt(timerEl.value) || 15) : 15;

    const customBrands = [];
    for (let i = 1; i <= 10; i++) {
        const nameEl = document.getElementById(`c-brand-${i}-name`);
        const slugEl = document.getElementById(`c-brand-${i}-slug`);
        const hintEl = document.getElementById(`c-brand-${i}-hint`);

        if (!nameEl || !slugEl) continue; 

        const bName = nameEl.value.trim();
        const bSlug = slugEl.value.trim().toLowerCase();
        const bHint = hintEl ? hintEl.value.trim() : "";

        if (!bName && !bSlug) continue; 

        if (!bName || !bSlug) {
            alert(`Brand #${i} requires both a Name and an SVG Slug.`);
            return;
        }

        customBrands.push({
            name: bName,
            slug: bSlug,
            hint: bHint || "No clues defined."
        });
    }

    if (customBrands.length === 0) {
        alert("Please add at least one valid Brand (Name + Slug)!");
        return;
    }

    const newRoom = {
        id: "custom_" + Date.now(),
        name: levelName,
        category: category,
        difficulty: difficulty,
        theme: theme,
        timer: timer,
        brands: customBrands
    };

    if (!GAME_STATE.saveData.customLevels) GAME_STATE.saveData.customLevels = [];
    GAME_STATE.saveData.customLevels.push(newRoom);

    sendNativeRequest({ Action: "write_save", Data: GAME_STATE.saveData });
    updateGlobalStatsHUD();
    alert("Level Room Successfully Published!");
    
    renderCategoryCards();
    showScreen("screen-categories");
}

function launchLevel(levelNum) {
    GAME_STATE.currentLevel = levelNum;
    GAME_STATE.currentBrandIndex = 0;
    GAME_STATE.currentLevelCorrectCount = 0;
    GAME_STATE.currentLevelScore = 0;
    GAME_STATE.lives = 3;

    // Seeds our brand compiler dynamically
    GAME_STATE.activeBrands = getBrandsForLevel(GAME_STATE.currentCategory, levelNum);

    showScreen("screen-gameplay");
    loadNextBrand();
}

function launchCustomLevel(customIndex) {
    const targetRoom = GAME_STATE.saveData.customLevels[customIndex];
    GAME_STATE.currentLevel = customIndex;
    GAME_STATE.currentBrandIndex = 0;
    GAME_STATE.currentLevelCorrectCount = 0;
    GAME_STATE.currentLevelScore = 0;
    GAME_STATE.lives = 3;

    GAME_STATE.activeBrands = targetRoom.brands;

    clearCustomThemeClasses();
    if (targetRoom.theme) {
        document.body.classList.add(`theme-${targetRoom.theme}`);
    }

    showScreen("screen-gameplay");
    loadNextBrand();
}

function loadNextBrand() {
    clearInterval(GAME_STATE.timerInterval);
    const inputField = document.getElementById("input-guess");
    if (inputField) inputField.value = "";
    
    const clueText = document.getElementById("clue-text");
    if (clueText) clueText.classList.add("hidden");
    
    GAME_STATE.revealedIndices = [];

    GAME_STATE.currentBrand = GAME_STATE.activeBrands[GAME_STATE.currentBrandIndex];
    const brandIdx = document.getElementById("gameplay-brand-index");
    if (brandIdx) brandIdx.textContent = `${GAME_STATE.currentBrandIndex + 1} / ${GAME_STATE.activeBrands.length}`;
    
    let hearts = "";
    for (let i = 0; i < GAME_STATE.lives; i++) hearts += "❤";
    const livesEl = document.getElementById("gameplay-lives");
    if (livesEl) livesEl.textContent = hearts;

    renderRevealedLetters();

    const img = document.getElementById("logo-image");
    const placeholder = document.getElementById("logo-placeholder");
    if (img) {
        img.src = `https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/${GAME_STATE.currentBrand.slug}.svg`;
        img.style.filter = "grayscale(1) brightness(0.15)";

        img.onerror = () => { 
            img.classList.add("hidden"); 
            if (placeholder) placeholder.classList.remove("hidden"); 
        };
        img.onload = () => { 
            img.classList.remove("hidden"); 
            if (placeholder) placeholder.classList.add("hidden"); 
        };
    }

    let timeLimit = 15;
    if (GAME_STATE.currentCategory === "custom") {
        const currentCustomRoom = GAME_STATE.saveData.customLevels[GAME_STATE.currentLevel];
        if (currentCustomRoom) {
            if (currentCustomRoom.timer) {
                timeLimit = currentCustomRoom.timer;
            } else {
                const diff = currentCustomRoom.difficulty || "medium";
                if (diff === "easy") timeLimit = 30;
                else if (diff === "hard") timeLimit = 8;
            }
        }
    } else {
        if (GAME_STATE.saveData.difficulty === "easy") timeLimit = 30;
        if (GAME_STATE.saveData.difficulty === "hard") timeLimit = 8;
    }

    GAME_STATE.elapsedTime = 0;
    const bar = document.getElementById("timer-bar");
    if (bar) {
        bar.style.width = "100%";
        bar.style.backgroundColor = "#3b82f6";
    }

    GAME_STATE.timerInterval = setInterval(() => {
        GAME_STATE.elapsedTime += 0.1;
        const rem = Math.max(((timeLimit - GAME_STATE.elapsedTime) / timeLimit) * 100, 0);
        if (bar) {
            bar.style.width = `${rem}%`;
            if (rem < 30) bar.style.backgroundColor = "#ef4444";
            else if (rem < 60) bar.style.backgroundColor = "#f59e0b";
        }

        if (GAME_STATE.elapsedTime >= timeLimit) {
            clearInterval(GAME_STATE.timerInterval);
            processLossOfLife();
        }
    }, 100);
}

// --- WEB COMPATIBLE LEVENSHTEIN SIMILARITY ENGINE ---
function cleanStringForMatch(str) {
    return str.toLowerCase().replace(/[^a-z0-9]/g, "").trim();
}

function calculateMatchPercentage(str1, str2) {
    const s1 = cleanStringForMatch(str1);
    const s2 = cleanStringForMatch(str2);
    if (s1 === s2) return 100;
    if (s1.length === 0 || s2.length === 0) return 0;
    if (s1.includes(s2) || s2.includes(s1)) {
        return (Math.min(s1.length, s2.length) / Math.max(s1.length, s2.length)) * 100;
    }

    const matrix = Array(s2.length + 1).fill(null).map(() => Array(s1.length + 1).fill(null));
    for (let i = 0; i <= s1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= s2.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= s2.length; j++) {
        for (let i = 1; i <= s1.length; i++) {
            const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
            matrix[j][i] = Math.min(
                matrix[j][i - 1] + 1, // insertion
                matrix[j - 1][i] + 1, // deletion
                matrix[j - 1][i - 1] + cost // substitution
            );
        }
    }

    const distance = matrix[s2.length][s1.length];
    const longest = Math.max(s1.length, s2.length);
    return ((longest - distance) / longest) * 100;
}

function submitUserGuess() {
    const inputField = document.getElementById("input-guess");
    const guess = inputField ? inputField.value.trim() : "";
    if (!guess) return;
    clearInterval(GAME_STATE.timerInterval);

    const matchPct = calculateMatchPercentage(guess, GAME_STATE.currentBrand.name);
    const isCorrect = matchPct >= 80;

    // Web-native points mathematical equation:
    // $$P = \max(50 - (T \times 3), 10)$$
    // where $$P$$ is points awarded and $$T$$ is the time elapsed in seconds.
    const points = isCorrect ? Math.max(50 - Math.round(GAME_STATE.elapsedTime) * 3, 10) : 0;

    if (window.chrome && window.chrome.webview && window.chrome.webview.postMessage) {
        window.chrome.webview.postMessage({
            UserGuess: guess,
            CorrectAnswer: GAME_STATE.currentBrand.name,
            TimeElapsed: Math.round(GAME_STATE.elapsedTime)
        });
    } else {
        onMatchResult({ match: matchPct, correct: isCorrect, score: points });
    }
}

function onMatchResult(result) {
    const badge = document.getElementById("feedback-badge");
    const overlay = document.getElementById("feedback-overlay");
    const textAns = document.getElementById("feedback-answer");
    const statsCard = document.getElementById("feedback-stats-card");

    if (overlay) overlay.classList.remove("hidden");
    if (textAns) textAns.textContent = GAME_STATE.currentBrand.name;

    const img = document.getElementById("logo-image");
    if (img) img.style.filter = "grayscale(0) brightness(1)";

    if (result.correct) {
        sfx.playCoin();
        if (badge) {
            badge.textContent = "CORRECT!";
            badge.className = "gaming-font text-5xl font-black uppercase text-center tracking-widest text-emerald-400";
        }
        const matchEl = document.getElementById("feedback-match");
        if (matchEl) matchEl.textContent = `${Math.round(result.match)}%`;
        
        const finalScore = Math.max(result.score - (GAME_STATE.revealedIndices.length * 10), 5);
        const scoreEl = document.getElementById("feedback-score");
        if (scoreEl) scoreEl.textContent = `+${finalScore}`;
        if (statsCard) statsCard.classList.remove("hidden");

        GAME_STATE.currentLevelScore += finalScore;
        GAME_STATE.currentLevelCorrectCount++;
    } else {
        sfx.playWrong();
        triggerVibration();
        if (badge) {
            badge.textContent = "INCORRECT";
            badge.className = "gaming-font text-5xl font-black uppercase text-center tracking-widest text-red-500";
        }
        if (statsCard) statsCard.classList.add("hidden");
        GAME_STATE.lives--;
    }

    const nextBtn = document.getElementById("btn-feedback-next");
    if (nextBtn) {
        nextBtn.onclick = () => {
            if (overlay) overlay.classList.add("hidden");
            if (GAME_STATE.lives <= 0) triggerLevelEnd(false);
            else advanceTurn();
        };
    }
}
window.onMatchResult = onMatchResult;

function processLossOfLife() {
    sfx.playWrong();
    triggerVibration();
    GAME_STATE.lives--;

    const badge = document.getElementById("feedback-badge");
    const overlay = document.getElementById("feedback-overlay");
    const textAns = document.getElementById("feedback-answer");
    const statsCard = document.getElementById("feedback-stats-card");

    if (overlay) overlay.classList.remove("hidden");
    if (badge) {
        badge.textContent = "TIME OUT";
        badge.className = "gaming-font text-5xl font-black uppercase text-center tracking-widest text-red-500";
    }
    if (textAns) textAns.textContent = GAME_STATE.currentBrand.name;
    if (statsCard) statsCard.classList.add("hidden");

    const nextBtn = document.getElementById("btn-feedback-next");
    if (nextBtn) {
        nextBtn.onclick = () => {
            if (overlay) overlay.classList.add("hidden");
            if (GAME_STATE.lives <= 0) triggerLevelEnd(false);
            else advanceTurn();
        };
    }
}

function advanceTurn() {
    GAME_STATE.currentBrandIndex++;
    if (GAME_STATE.currentBrandIndex >= GAME_STATE.activeBrands.length) triggerLevelEnd(true);
    else loadNextBrand();
}

function triggerLevelEnd(completed) {
    clearInterval(GAME_STATE.timerInterval);
    const starsEl = document.getElementById("report-stars");
    const correctCountEl = document.getElementById("report-correct-count");
    const scoreEl = document.getElementById("report-score");
    const highEl = document.getElementById("report-cat-high");

    const totalBrands = GAME_STATE.activeBrands.length;
    if (correctCountEl) correctCountEl.textContent = `${GAME_STATE.currentLevelCorrectCount} / ${totalBrands}`;
    if (scoreEl) scoreEl.textContent = GAME_STATE.currentLevelScore;

    const isCustom = GAME_STATE.currentCategory === "custom";
    const passingThreshold = Math.ceil(totalBrands * 0.75);

    const reportHeader = document.querySelector("#screen-report h2");

    if (completed && GAME_STATE.currentLevelCorrectCount >= passingThreshold) {
        sfx.playFanfare();
        if (reportHeader) {
            reportHeader.textContent = "LEVEL CLEAR!";
            reportHeader.className = "gaming-font text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-500 uppercase tracking-widest";
        }

        let stars = "★☆☆";
        if (GAME_STATE.currentLevelCorrectCount === totalBrands) stars = "★★★";
        else if (GAME_STATE.currentLevelCorrectCount >= passingThreshold) stars = "★★☆";
        
        if (starsEl) {
            starsEl.textContent = stars;
            starsEl.className = "text-yellow-400 text-6xl tracking-wider select-none py-2";
        }

        if (isCustom) {
            GAME_STATE.saveData.customScore = (GAME_STATE.saveData.customScore || 0) + GAME_STATE.currentLevelScore;
        } else {
            const currentCatUnlocked = GAME_STATE.saveData.levelsUnlocked[GAME_STATE.currentCategory] || 1;
            if (GAME_STATE.currentLevel === currentCatUnlocked && currentCatUnlocked < 100) {
                GAME_STATE.saveData.levelsUnlocked[GAME_STATE.currentCategory] = currentCatUnlocked + 1;
            }
            GAME_STATE.saveData.categoryScores[GAME_STATE.currentCategory] += GAME_STATE.currentLevelScore;
            GAME_STATE.saveData.globalScore += GAME_STATE.currentLevelScore;
        }
    } else {
        sfx.playWrong();
        triggerVibration();
        if (reportHeader) {
            reportHeader.textContent = "LEVEL FAILED";
            reportHeader.className = "gaming-font text-3xl font-black text-red-500 uppercase tracking-widest";
        }
        if (starsEl) {
            starsEl.textContent = "☆☆☆";
            starsEl.className = "text-gray-700 text-6xl tracking-wider select-none py-2";
        }
    }

    if (highEl) {
        if (isCustom) {
            highEl.textContent = `${GAME_STATE.saveData.customScore || 0} (Custom Arena Total)`;
        } else {
            highEl.textContent = GAME_STATE.saveData.categoryScores[GAME_STATE.currentCategory];
        }
    }

    sendNativeRequest({ Action: "write_save", Data: GAME_STATE.saveData });
    updateGlobalStatsHUD();
    showScreen("screen-report");
}

function applyWindowBounds() {
    const res = GAME_STATE.saveData.resolution || "1024x768";
    const parts = res.split("x");
    const width = parseInt(parts[0]);
    const height = parseInt(parts[1]);

    const mainContainer = document.querySelector("main");
    if (mainContainer) {
        mainContainer.style.maxWidth = `${width}px`;
        mainContainer.style.maxHeight = `${height}px`;
        mainContainer.style.width = "100%";
        mainContainer.style.height = "100%";
    }
}

function applyVisualSettings() {
    const isLow = GAME_STATE.saveData.quality === "low";
    const btnLow = document.getElementById("btn-qual-low");
    const btnHigh = document.getElementById("btn-qual-high");

    if (isLow) {
        document.body.classList.add("low-quality");
        if (btnLow) btnLow.className = "px-3 py-2 text-[10px] font-bold rounded-lg bg-blue-600 text-white transition";
        if (btnHigh) btnHigh.className = "px-3 py-2 text-[10px] font-bold rounded-lg bg-gray-900 text-gray-400 transition";
    } else {
        document.body.classList.remove("low-quality");
        if (btnLow) btnLow.className = "px-3 py-2 text-[10px] font-bold rounded-lg bg-gray-900 text-gray-400 transition";
        if (btnHigh) btnHigh.className = "px-3 py-2 text-[10px] font-bold rounded-lg bg-blue-600 text-white transition";
    }

    const rawBrightness = GAME_STATE.saveData.brightness || 100;
    
    // Applying CSS Filter directly to `<main>` wrapper so UI dropdowns stay visible
    const mainContainer = document.querySelector("main");
    if (mainContainer) {
        mainContainer.style.filter = `brightness(${rawBrightness}%)`;
    } else {
        document.body.style.filter = `brightness(${rawBrightness}%)`;
    }
}

function applyFrameBudgeting() {
    const val = GAME_STATE.saveData.fpsLimit || "uncapped";
    ["30", "60", "uncapped"].forEach(fps => {
        const btn = document.getElementById(`btn-fps-${fps}`);
        if (btn) {
            if (val === fps) btn.className = "px-3 py-2 text-[10px] font-bold rounded-lg bg-blue-600 text-white transition";
            else btn.className = "px-3 py-2 text-[10px] font-bold rounded-lg bg-gray-900 text-gray-400 transition";
        }
    });

    if (gameLoopId) cancelAnimationFrame(gameLoopId);
    
    if (val === "30") {
        lockAnimationFramerate(30);
    } else if (val === "60") {
        lockAnimationFramerate(60);
    }
}

function lockAnimationFramerate(fps) {
    let lastTime = performance.now();
    const interval = 1000 / fps;
    
    function loop(time) {
        gameLoopId = requestAnimationFrame(loop);
        const delta = time - lastTime;
        if (delta >= interval) {
            lastTime = time - (delta % interval);
        }
    }
    gameLoopId = requestAnimationFrame(loop);
}

function applyVSyncStatus() {
    const val = GAME_STATE.saveData.vsync;
    const btnOn = document.getElementById("btn-vsync-on");
    const btnOff = document.getElementById("btn-vsync-off");

    if (val) {
        if (btnOn) btnOn.className = "px-3 py-2 text-[10px] font-bold rounded-lg bg-blue-600 text-white transition";
        if (btnOff) btnOff.className = "px-3 py-2 text-[10px] font-bold rounded-lg bg-gray-900 text-gray-400 transition";
    } else {
        if (btnOn) btnOn.className = "px-3 py-2 text-[10px] font-bold rounded-lg bg-gray-900 text-gray-400 transition";
        if (btnOff) btnOff.className = "px-3 py-2 text-[10px] font-bold rounded-lg bg-blue-600 text-white transition";
    }
    sendNativeRequest({ Action: "configure_vsync", Value: val });
}

function syncSettingsPanel() {
    // 1. Sync Volume Control Elements
    const volSlider = document.getElementById("settings-volume") || document.getElementById("volume-slider");
    if (volSlider) volSlider.value = GAME_STATE.saveData.volume;
    sfx.volume = GAME_STATE.saveData.volume;
    
    const volLabel = document.getElementById("volume-label") || document.getElementById("lbl-volume");
    if (volLabel) volLabel.textContent = `${Math.round(GAME_STATE.saveData.volume * 100)}%`;
    
    // 2. Sync Brightness Control Elements
    const briSlider = document.getElementById("settings-brightness") || document.getElementById("brightness-slider");
    const bright = GAME_STATE.saveData.brightness || 100;
    if (briSlider) briSlider.value = bright;
    
    const briLabel = document.getElementById("brightness-label") || document.getElementById("lbl-brightness");
    if (briLabel) briLabel.textContent = `${bright}%`;

    // 3. Sync Remaining Engine Profiles
    updateDifficultyToggles();
    updateResolutionButtons();
    updateVibrationButton();
    applyFrameBudgeting();
    applyVSyncStatus();
    applyWindowBounds();
}

function updateResolutionButtons() {
    const res = GAME_STATE.saveData.resolution;
    ["800x600", "1024x768", "1280x960"].forEach(sz => {
        let btnId = "btn-win-sm";
        if (sz === "1024x768") btnId = "btn-win-md";
        if (sz === "1280x960") btnId = "btn-win-lg";
        
        const btn = document.getElementById(btnId);
        if (btn) {
            if (res === sz) btn.className = "px-3 py-2 text-[10px] font-bold rounded-lg bg-blue-600 text-white transition";
            else btn.className = "px-3 py-2 text-[10px] font-bold rounded-lg bg-gray-900 text-gray-400 transition";
        }
    });
}

function updateVibrationButton() {
    const active = GAME_STATE.saveData.vibration;
    const btn = document.getElementById("btn-vibrate-toggle") || document.getElementById("vibration-toggle");
    if (btn) {
        if (active) {
            btn.textContent = "Enabled";
            btn.className = "px-4 py-2 text-[10px] font-bold rounded-lg bg-blue-600 text-white uppercase";
        } else {
            btn.textContent = "Disabled";
            btn.className = "px-4 py-2 text-[10px] font-bold rounded-lg bg-gray-900 text-gray-400 uppercase";
        }
    }
}

function updateDifficultyToggles() {
    ["easy", "medium", "hard"].forEach(df => {
        const btn = document.getElementById(`diff-${df}`);
        if (btn) {
            if (GAME_STATE.saveData.difficulty === df) {
                btn.className = "px-3 py-2 text-[10px] font-bold rounded-lg bg-blue-600 text-white transition";
            } else {
                btn.className = "px-3 py-2 text-[10px] font-bold rounded-lg bg-gray-900 text-gray-400 transition";
            }
        }
    });
}

/* BrandGame_V3 - https://github.com/darksy2027-ctrl/BrandGame_V3 - Copyright (c) darksy */
