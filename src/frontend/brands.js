const BRAND_DATABASE = {
    tech: [
        // Level 1
        { name: "Apple", slug: "apple", color: "#000000", difficulty: 1, hint: "Co-founded by Steve Jobs, revolutionized smartphones." },
        { name: "Google", slug: "google", color: "#4285F4", difficulty: 1, hint: "The world's most dominant search engine." },
        { name: "Microsoft", slug: "microsoft", color: "#F25022", difficulty: 1, hint: "Creators of Windows and Office suites." },
        { name: "Amazon", slug: "amazon", color: "#FF9900", difficulty: 1, hint: "The e-commerce giant with an 'A to Z' smile." },
        // Level 2
        { name: "Meta", slug: "meta", color: "#0668E1", difficulty: 2, hint: "Parent company of Facebook, Instagram, and WhatsApp." },
        { name: "Netflix", slug: "netflix", color: "#E50914", difficulty: 2, hint: "The pioneer of online video streaming subscription services." },
        { name: "Spotify", slug: "spotify", color: "#1DB954", difficulty: 2, hint: "Swedish music and podcast streaming giant." },
        { name: "TikTok", slug: "tiktok", color: "#000000", difficulty: 2, hint: "Short-form mobile video app owned by ByteDance." },
        // Level 3
        { name: "Nvidia", slug: "nvidia", color: "#76B900", difficulty: 3, hint: "Leading designer of graphics processing units (GPUs)." },
        { name: "Intel", slug: "intel", color: "#0071C5", difficulty: 3, hint: "Famous for 'Intel Inside' processors and silicon chips." },
        { name: "Adobe", slug: "adobe", color: "#FF0000", difficulty: 3, hint: "Creative suite makers: Photoshop, Illustrator, Premiere." },
        { name: "Sony", slug: "sony", color: "#000000", difficulty: 3, hint: "Japanese conglomerate behind Walkman and PlayStation." },
        // Level 4
        { name: "Samsung", slug: "samsung", color: "#1428A0", difficulty: 4, hint: "South Korean giant known for Galaxy smartphones." },
        { name: "Nintendo", slug: "nintendo", color: "#E60012", difficulty: 4, hint: "Video game legends who created Mario and Zelda." },
        { name: "HP", slug: "hp", color: "#0096D6", difficulty: 4, hint: "Major computer manufacturer founded in a Palo Alto garage." },
        { name: "Dell", slug: "dell", color: "#006BCE", difficulty: 4, hint: "Famous for customizable build-to-order PCs and enterprise servers." },
        // Level 5
        { name: "Oracle", slug: "oracle", color: "#F80000", difficulty: 5, hint: "Database giant that bought Sun Microsystems (Java)." },
        { name: "IBM", slug: "ibm", color: "#052FAD", difficulty: 5, hint: "Often referred to as 'Big Blue'." },
        { name: "Salesforce", slug: "salesforce", color: "#00A1E0", difficulty: 5, hint: "Cloud-based customer relationship management (CRM) software." },
        { name: "AMD", slug: "amd", color: "#ED1C24", difficulty: 5, hint: "CPU & GPU manufacturer, creator of Ryzen processors." },
        // Level 6
        { name: "Cisco", slug: "cisco", color: "#11A9E2", difficulty: 6, hint: "Networking hardware giant, logo mimics Golden Gate Bridge." },
        { name: "Asus", slug: "asus", color: "#00539B", difficulty: 6, hint: "Taiwanese hardware company behind 'Republic of Gamers' (ROG)." },
        { name: "Lenovo", slug: "lenovo", color: "#E11927", difficulty: 6, hint: "Chinese tech company that acquired IBM's ThinkPad line." },
        { name: "Xiaomi", slug: "xiaomi", color: "#FF6700", difficulty: 6, hint: "Known as the 'Apple of China', manufactures a vast ecosystem." },
        // Level 7
        { name: "Shopify", slug: "shopify", color: "#96BF48", difficulty: 7, hint: "E-commerce platform allowing users to start custom online stores." },
        { name: "Zoom", slug: "zoom", color: "#2D8CFF", difficulty: 7, hint: "Became a household name for video calls during 2020." },
        { name: "Slack", slug: "slack", color: "#4A154B", difficulty: 7, hint: "Corporate instant messaging tool with colorful hashtag logo." },
        { name: "Dropbox", slug: "dropbox", color: "#0061FE", difficulty: 7, hint: "Cloud storage service characterized by an open blue box." },
        // Level 8
        { name: "Stripe", slug: "stripe", color: "#635BFF", difficulty: 8, hint: "Payment processing software infrastructure for the internet." },
        { name: "GitHub", slug: "github", color: "#181717", difficulty: 8, hint: "Platform for Git version control, represented by the Octocat." },
        { name: "Figma", slug: "figma", color: "#F24E1E", difficulty: 8, hint: "Collaborative web-based UI design tool acquired and later abandoned by Adobe." },
        { name: "Arduino", slug: "arduino", color: "#00979D", difficulty: 8, hint: "Open-source electronic prototyping platform with teal infinity logo." },
        // Level 9
        { name: "Docker", slug: "docker", color: "#2496ED", difficulty: 9, hint: "Software containerization platform with a whale carrying shipping containers." },
        { name: "Cloudflare", slug: "cloudflare", color: "#F38020", difficulty: 9, hint: "Web infrastructure and security company with a cloud logo." },
        { name: "Notion", slug: "notion", color: "#000000", difficulty: 9, hint: "All-in-one workspaces software with minimal black/white block aesthetics." },
        { name: "Vercel", slug: "vercel", color: "#000000", difficulty: 9, hint: "Hosting platform for frontend frameworks, developers of Next.js." },
        // Level 10
        { name: "Asml", slug: "asml", color: "#00AEEF", difficulty: 10, hint: "Dutch microchip machine manufacturer; the bottleneck of global supply." },
        { name: "Kubernetes", slug: "kubernetes", color: "#326CE5", difficulty: 10, hint: "Open-source container orchestration system originally designed by Google." },
        { name: "Supabase", slug: "supabase", color: "#3ECF8E", difficulty: 10, hint: "Open-source Firebase alternative utilizing Postgres database." },
        { name: "Raspberry Pi", slug: "raspberrypi", color: "#C51A4A", difficulty: 10, hint: "UK-designed single-board computer shaped like a berry." }
    ],
    auto: [
        // Level 1
        { name: "Tesla", slug: "tesla", color: "#CC0000", difficulty: 1, hint: "Electric vehicle maker led by Elon Musk." },
        { name: "Ford", slug: "ford", color: "#003399", difficulty: 1, hint: "Pioneered mass assembly lines with the Model T." },
        { name: "Toyota", slug: "toyota", color: "#EB0A1E", difficulty: 1, hint: "Japanese giant, famous for ultra-reliable sedans like the Corolla." },
        { name: "Ferrari", slug: "ferrari", color: "#FFEB00", difficulty: 1, hint: "Iconic Italian supercars sporting the Prancing Horse." },
        // Level 2
        { name: "BMW", slug: "bmw", color: "#0066B2", difficulty: 2, hint: "Bavarian brand known as the Ultimate Driving Machine." },
        { name: "Mercedes", slug: "mercedesbenz", color: "#000000", difficulty: 2, hint: "Inventor of the modern automobile, sporting a 3-pointed star." },
        { name: "Audi", slug: "audi", color: "#000000", difficulty: 2, hint: "German premium brand represented by four interlocking rings." },
        { name: "Porsche", slug: "porsche", color: "#DE3532", difficulty: 2, hint: "Stuttgart sports cars, legendary for the rear-engine 911." },
        // Level 3
        { name: "Honda", slug: "honda", color: "#E3120B", difficulty: 3, hint: "Superb reliability, makes legendary Civic, Accord, and motorcycles." },
        { name: "Chevrolet", slug: "chevrolet", color: "#CD9834", difficulty: 3, hint: "American brand with a 'bowtie' logo; makers of the Corvette." },
        { name: "Volkswagen", slug: "volkswagen", color: "#181F3D", difficulty: 3, hint: "Translates to 'People's Car', makers of the Beetle and Golf." },
        { name: "Lamborghini", slug: "lamborghini", color: "#DDB321", difficulty: 3, hint: "Outrageous angular supercars sporting a golden charging bull." },
        // Level 4
        { name: "Hyundai", slug: "hyundai", color: "#002C5F", difficulty: 4, hint: "South Korean giant with a stylized tilted 'H' logo." },
        { name: "Nissan", slug: "nissan", color: "#C3002F", difficulty: 4, hint: "Japanese brand behind the GT-R, Leaf, and Z-cars." },
        { name: "Jeep", slug: "jeep", color: "#1E3F20", difficulty: 4, hint: "Synonymous with rugged off-roading and 7-slot front grilles." },
        { name: "Subaru", slug: "subaru", color: "#001B4B", difficulty: 4, hint: "Japanese symmetrical all-wheel drive, represented by Pleiades stars." },
        // Level 5
        { name: "Mazda", slug: "mazda", color: "#10223D", difficulty: 5, hint: "Japanese brand famous for the Rotary engine and Miata roadster." },
        { name: "Lexus", slug: "lexus", color: "#0A0A0A", difficulty: 5, hint: "Toyota's luxury brand, denoted by an elegant L in an oval." },
        { name: "Kia", slug: "kia", color: "#05141F", difficulty: 5, hint: "South Korean automaker with a futuristic minimalist wordmark." },
        { name: "Volvo", slug: "volvo", color: "#00205B", difficulty: 5, hint: "Swedish brand synonymous with safety; logo is symbol for iron/male." },
        // Level 6
        { name: "Jaguar", slug: "jaguar", color: "#00412D", difficulty: 6, hint: "British luxury line with a leaping predatory cat ornament." },
        { name: "Aston Martin", slug: "astonmartin", color: "#006643", difficulty: 6, hint: "Sophisticated British brand, famously driven by James Bond." },
        { name: "Peugeot", slug: "peugeot", color: "#000000", difficulty: 6, hint: "French automaker, logos features a roaring lion profile." },
        { name: "Renault", slug: "renault", color: "#FFCC33", difficulty: 6, hint: "French manufacturer famous for its diamond-shaped logo." },
        // Level 7
        { name: "Fiat", slug: "fiat", color: "#900020", difficulty: 7, hint: "Italian urban mini cars, famous for the retro 500 model." },
        { name: "Mitsubishi", slug: "mitsubishi", color: "#E60012", difficulty: 7, hint: "Logo represents three red diamonds joined at the center." },
        { name: "Land Rover", slug: "landrover", color: "#005A2B", difficulty: 7, hint: "British luxury off-road icons, makers of Range Rover." },
        { name: "Maserati", slug: "maserati", color: "#0C2340", difficulty: 7, hint: "Italian performance luxury cars featuring Neptune's Trident." },
        // Level 8
        { name: "Bentley", slug: "bentley", color: "#005544", difficulty: 8, hint: "High-end British luxury brand sporting winged 'B' badge." },
        { name: "Rolls-Royce", slug: "rollsroyce", color: "#3B1E43", difficulty: 8, hint: "Symbol of absolute wealth, featuring the Spirit of Ecstasy." },
        { name: "Bugatti", slug: "bugatti", color: "#184D9C", difficulty: 8, hint: "Hyperspeed vehicles; creators of Veyron and Chiron." },
        { name: "Alfa Romeo", slug: "alfaromeo", color: "#8C1D40", difficulty: 8, hint: "Milanese brand featuring a snake eating a man on its shield." },
        // Level 9
        { name: "McLaren", slug: "mclaren", color: "#FF8000", difficulty: 9, hint: "High-performance British F1 team and supercar constructor." },
        { name: "Suzuki", slug: "suzuki", color: "#0057B8", difficulty: 9, hint: "Japanese brand, highly respected for small SUVs and sportbikes." },
        { name: "Rivian", slug: "rivian", color: "#FFC72C", difficulty: 9, hint: "Modern electric truck start-up featuring unique stadium headlights." },
        { name: "Lucid", slug: "lucidmotors", color: "#000000", difficulty: 9, hint: "Ultra-luxury electric vehicle start-up with sleek linear design." },
        // Level 10
        { name: "Koenigsegg", slug: "koenigsegg", color: "#FFD300", difficulty: 10, hint: "Swedish boutique megacar maker utilizing wild engineering concepts." },
        { name: "Pagani", slug: "pagani", color: "#000000", difficulty: 10, hint: "Boutique Italian hypercar maker, builders of Zonda and Huayra." },
        { name: "Rimac", slug: "rimacautomobili", color: "#0096B4", difficulty: 10, hint: "Croatian electric hypercar company that now runs Bugatti." },
        { name: "Polestar", slug: "polestar", color: "#000000", difficulty: 10, hint: "Electric performance sub-brand of Volvo, styled as a star." }
    ],
    food: [
        // Level 1
        { name: "Coca-Cola", slug: "cocacola", color: "#F40009", difficulty: 1, hint: "The world's most famous carbonated soft drink." },
        { name: "Pepsi", slug: "pepsi", color: "#0020C2", difficulty: 1, hint: "The main rival of Coca-Cola with a red, white, and blue circle." },
        { name: "McDonald's", slug: "mcdonalds", color: "#F5C400", difficulty: 1, hint: "Fast-food chain symbolized by the Golden Arches." },
        { name: "Starbucks", slug: "starbucks", color: "#00704A", difficulty: 1, hint: "Coffeehouse chain featuring a green twin-tailed mermaid." },
        // Level 2
        { name: "Burger King", slug: "burgerking", color: "#F5EB0A", difficulty: 2, hint: "Home of the flame-broiled Whopper." },
        { name: "Subway", slug: "subway", color: "#008C44", difficulty: 2, hint: "Fast food chain where sandwiches are 'built' by artists." },
        { name: "KFC", slug: "kfc", color: "#A3080C", difficulty: 2, hint: "Fried chicken giant founded by Colonel Sanders." },
        { name: "Heineken", slug: "heineken", color: "#008200", difficulty: 2, hint: "Dutch pale lager beer in a green bottle with a red star." },
        // Level 3
        { name: "Nutella", slug: "nutella", color: "#4E2B1F", difficulty: 3, hint: "Popular hazelnut cocoa spread made by Ferrero." },
        { name: "Red Bull", slug: "redbull", color: "#001E62", difficulty: 3, hint: "Austrian energy drink that 'gives you wings'." },
        { name: "Monster", slug: "monsterenergy", color: "#000000", difficulty: 3, hint: "Energy drink sporting a green 'claw' scratch mark." },
        { name: "Heinz", slug: "heinz", color: "#9E002B", difficulty: 3, hint: "Famous for its slow-pouring tomato ketchup (57 Varieties)." },
        // Level 4
        { name: "Oreo", slug: "oreo", color: "#002F6C", difficulty: 4, hint: "Sandwich cookie containing sweet cream between two chocolate wafers." },
        { name: "Pringles", slug: "pringles", color: "#E51B24", difficulty: 4, hint: "Stackable potato chips in a cardboard tube with a mustached mascot." },
        { name: "Dominos", slug: "dominos", color: "#006491", difficulty: 4, hint: "Pizza delivery franchise using a blue and red gaming tile logo." },
        { name: "Pizza Hut", slug: "pizzahut", color: "#EE3124", difficulty: 4, hint: "Red-roof styled fast-food pizza restaurant." },
        // Level 5
        { name: "Nestle", slug: "nestle", color: "#414042", difficulty: 5, hint: "Swiss conglomerate, logo displays baby birds in a nest." },
        { name: "Danone", slug: "danone", color: "#0055A5", difficulty: 5, hint: "French multinational food group famed for yogurt and Evian water." },
        { name: "Guinness", slug: "guinness", color: "#000000", difficulty: 5, hint: "Irish dark stout beer, using the Brian Boru gold harp logo." },
        { name: "Taco Bell", slug: "tacobell", color: "#702082", difficulty: 5, hint: "Mexican-inspired fast food restaurant using a purple bell logo." },
        // Level 6
        { name: "Kelloggs", slug: "kelloggs", color: "#D11242", difficulty: 6, hint: "Famous for breakfast cereals like Corn Flakes and Frosted Flakes." },
        { name: "Cadbury", slug: "cadbury", color: "#421C7B", difficulty: 6, hint: "British confectionery company famed for Dairy Milk and purple wrapping." },
        { name: "Lays", slug: "lays", color: "#F71322", difficulty: 6, hint: "Potato chips brand featuring a yellow sun orb behind a red ribbon." },
        { name: "Budweiser", slug: "budweiser", color: "#C41230", difficulty: 6, hint: "American lager, often referred to as the 'King of Beers'." },
        // Level 7
        { name: "Nespresso", slug: "nespresso", color: "#1E1E1E", difficulty: 7, hint: "Premium coffee machine system using single-use aluminum pods." },
        { name: "Dunkin", slug: "dunkin", color: "#FF671F", difficulty: 7, hint: "Coffee and donut company using pink and orange wordmarks." },
        { name: "Campbell's", slug: "campbell soup company", color: "#C41230", difficulty: 7, hint: "Canned soups immortalized in pop art by Andy Warhol." },
        { name: "Chipotle", slug: "chipotle", color: "#451400", difficulty: 7, hint: "Fast casual Mexican grill focused on customizable burritos." },
        // Level 8
        { name: "Knorr", slug: "knorr", color: "#007A3E", difficulty: 8, hint: "German food brand famed for bouillion cubes, soups, and seasonings." },
        { name: "McCafe", slug: "mccafe", color: "#3B2516", difficulty: 8, hint: "McDonald's coffee-house style food and drink chain." },
        { name: "Bacardi", slug: "bacardi", color: "#000000", difficulty: 8, hint: "Famous white rum brand featuring a bat silhouette on its circular logo." },
        { name: "Gatorade", slug: "gatorade", color: "#FF6600", difficulty: 8, hint: "Sports-themed beverage with a bold 'G' and lightning bolt." },
        // Level 9
        { name: "Corona", slug: "corona", color: "#002060", difficulty: 9, hint: "Mexican pale lager, traditionally served with a wedge of lime." },
        { name: "Fanta", slug: "fanta", color: "#FF9E1B", difficulty: 9, hint: "Fruit-flavored soda originally created in Germany during WWII." },
        { name: "Chupa Chups", slug: "chupachups", color: "#E02128", difficulty: 9, hint: "Spanish lollipop brand whose flower logo was designed by Salvador Dalí." },
        { name: "Tabasco", slug: "tabasco", color: "#006432", difficulty: 9, hint: "American brand of hot sauce made from aged red peppers and vinegar." },
        // Level 10
        { name: "Tito's", slug: "titosvodka", color: "#4D2B1A", difficulty: 10, hint: "Craft vodka brand produced in Austin, Texas, using copper pot stills." },
        { name: "Dr Pepper", slug: "drpepper", color: "#711F25", difficulty: 10, hint: "Texas-born soda formulated with a blend of 23 unique flavors." },
        { name: "Evian", slug: "evian", color: "#E2001A", difficulty: 10, hint: "High-end French mineral water sourced from the Alps." },
        { name: "Illy", slug: "illy", color: "#DA291C", difficulty: 10, hint: "Premium Italian espresso company with a simple red and white box logo." }
    ],
    fashion: [
        // Level 1
        { name: "Nike", slug: "nike", color: "#000000", difficulty: 1, hint: "Athletic wear giant represented by the Swoosh." },
        { name: "Adidas", slug: "adidas", color: "#000000", difficulty: 1, hint: "German sports giant characterized by the 3-Stripes design." },
        { name: "Gucci", slug: "gucci", color: "#000000", difficulty: 1, hint: "Flamboyant Italian fashion house represented by interlocking 'GG'." },
        { name: "Chanel", slug: "chanel", color: "#000000", difficulty: 1, hint: "French luxury house, creator of No. 5 perfume, logo is interlocking 'CC'." },
        // Level 2
        { name: "Louis Vuitton", slug: "louisvuitton", color: "#4E3629", difficulty: 2, hint: "Famed for luxury leather trunks with LV monogram pattern." },
        { name: "Rolex", slug: "rolex", color: "#006039", difficulty: 2, hint: "The gold standard of Swiss luxury watches, sporting a crown logo." },
        { name: "Zara", slug: "zara", color: "#000000", difficulty: 2, hint: "Spanish fast-fashion titan owned by Inditex." },
        { name: "H&M", slug: "hm", color: "#E3000F", difficulty: 2, hint: "Swedish fast-fashion giant with a red brush-stroke wordmark." },
        // Level 3
        { name: "Puma", slug: "puma", color: "#000000", difficulty: 3, hint: "Founded by Rudolf Dassler, brother of Adidas' founder." },
        { name: "Supreme", slug: "supreme", color: "#DA291C", difficulty: 3, hint: "Streetwear brand famous for its red and white Futura box logo." },
        { name: "Prada", slug: "prada", color: "#000000", difficulty: 3, hint: "Italian luxury label with a triangular metal rope logo crest." },
        { name: "Calvin Klein", slug: "calvinklein", color: "#000000", difficulty: 3, hint: "American fashion brand synonymous with iconic designer underwear." },
        // Level 4
        { name: "Cartier", slug: "cartier", color: "#000000", difficulty: 4, hint: "French jeweler and watchmaker, famous for the 'Love' bracelet." },
        { name: "Ralph Lauren", slug: "ralphlauren", color: "#002040", difficulty: 4, hint: "American preppy look, featuring a polo player riding a horse." },
        { name: "Levis", slug: "levis", color: "#C41230", difficulty: 4, hint: "The quintessential American denim blue jeans brand." },
        { name: "Lacoste", slug: "lacoste", color: "#00563F", difficulty: 4, hint: "Founded by a tennis champion, featuring a green crocodile logo." },
        // Level 5
        { name: "Hermes", slug: "hermes", color: "#F37021", difficulty: 5, hint: "Makers of the Birkin bag, featuring a horse carriage logo." },
        { name: "Versace", slug: "versace", color: "#000000", difficulty: 5, hint: "Bold Italian fashion house using the Medusa head logo." },
        { name: "Dior", slug: "dior", color: "#000000", difficulty: 5, hint: "French designer Christian who introduced the post-WWII 'New Look'." },
        { name: "Tommy Hilfiger", slug: "tommyhilfiger", color: "#001E62", difficulty: 5, hint: "American prep style, logo is a blue, white, and red nautical flag." },
        // Level 6
        { name: "Vans", slug: "vans", color: "#7F181B", difficulty: 6, hint: "Skate shoe brand famous for 'Off the Wall' wave-stripe canvas shoes." },
        { name: "The North Face", slug: "thenorthface", color: "#000000", difficulty: 6, hint: "Outdoor gear giant; logo represents Yosemite's Half Dome." },
        { name: "Under Armour", slug: "underarmour", color: "#000000", difficulty: 6, hint: "Performance wear brand with a linked 'U' and 'A' monogram." },
        { name: "Ray-Ban", slug: "rayban", color: "#E11B22", difficulty: 6, hint: "Famous for Aviator and Wayfarer lifestyle sunglasses." },
        // Level 7
        { name: "Seiko", slug: "seiko", color: "#000000", difficulty: 7, hint: "Japanese watch company that triggered the 1970s 'quartz crisis'." },
        { name: "Balenciaga", slug: "balenciaga", color: "#000000", difficulty: 7, hint: "Avant-garde French brand famous for sock sneakers and trash bag purses." },
        { name: "Fendi", slug: "fendi", color: "#000000", difficulty: 7, hint: "Italian fur and luxury goods company featuring double inverted 'F's." },
        { name: "Tiffany", slug: "tiffanyandco", color: "#81D8D0", difficulty: 7, hint: "Elite jeweler famous for luxury boxes colored in robin's egg blue." },
        // Level 8
        { name: "Omega", slug: "omega", color: "#C41230", difficulty: 8, hint: "Swiss watchmaker, creators of the Speedmaster 'Moonwatch'." },
        { name: "Burberry", slug: "burberry", color: "#000000", difficulty: 8, hint: "British heritage fashion brand famed for its checkered trench coat." },
        { name: "Givenchy", slug: "givenchy", color: "#000000", difficulty: 8, hint: "French haute couture brand utilizing a symmetric 4-fold 'G' logo." },
        { name: "Converse", slug: "converse", color: "#000000", difficulty: 8, hint: "Chuck Taylor All Star canvas basketball sneakers." },
        // Level 9
        { name: "Patagonia", slug: "patagonia", color: "#000000", difficulty: 9, hint: "Eco-friendly clothing brand, logo is the outline of Mount Fitz Roy." },
        { name: "New Balance", slug: "newbalance", color: "#D31245", difficulty: 9, hint: "Comfortable athletic sneakers sporting a speed-slashed 'NB' logo." },
        { name: "Lululemon", slug: "lululemon", color: "#D31245", difficulty: 9, hint: "Premium athletic yoga clothing featuring a stylized upside-down 'A'." },
        { name: "Moncler", slug: "moncler", color: "#002366", difficulty: 9, hint: "Luxury Italian down jacket specialist, sporting a rooster logo." },
        // Level 10
        { name: "Tag Heuer", slug: "tagheuer", color: "#006241", difficulty: 10, hint: "Avant-garde Swiss chronograph watch company closely tied to motorsport." },
        { name: "Asics", slug: "asics", color: "#001E62", difficulty: 10, hint: "Japanese high-performance running shoe brand (Anima Sana In Corpore Sano)." },
        { name: "Oakley", slug: "oakley", color: "#000000", difficulty: 10, hint: "High-end sporting eyewear and apparel featuring an oval 'O' logo." },
        { name: "Supreme", slug: "supreme", color: "#FF0000", difficulty: 10, hint: "Streetwear giant heavily utilizing Barbara Kruger-styled red blocks." }
    ],
    media: [
        // Level 1
        { name: "Disney", slug: "disney", color: "#005691", difficulty: 1, hint: "Entertainment empire created by Walt; famous for Mickey Mouse." },
        { name: "Marvel", slug: "marvel", color: "#F0141E", difficulty: 1, hint: "Home of Spider-Man, Avengers, and Iron Man." },
        { name: "Lego", slug: "lego", color: "#E60012", difficulty: 1, hint: "Danish plastic construction bricks that lock together." },
        { name: "Warner Bros", slug: "warnerbros", color: "#004B87", difficulty: 1, hint: "Historic movie studio, logo features a golden shield with 'WB'." },
        // Level 2
        { name: "PlayStation", slug: "playstation", color: "#003087", difficulty: 2, hint: "Sony's video game console franchise featuring a geometric P/S." },
        { name: "Xbox", slug: "xbox", color: "#107C10", difficulty: 2, hint: "Microsoft's gaming console featuring a glowing green sphere 'X'." },
        { name: "YouTube", slug: "youtube", color: "#FF0000", difficulty: 2, hint: "The world's premier user-generated video sharing platform." },
        { name: "Pixar", slug: "pixar", color: "#000000", difficulty: 2, hint: "CGI animation studio with an energetic desk lamp mascot (Luxo Jr.)." },
        // Level 3
        { name: "Star Wars", slug: "starwars", color: "#000000", difficulty: 3, hint: "Space opera franchise created by George Lucas." },
        { name: "DC", slug: "dccomics", color: "#0078F2", difficulty: 3, hint: "Comic publishers of Batman, Superman, and Wonder Woman." },
        { name: "Barbie", slug: "barbie", color: "#E0218A", difficulty: 3, hint: "Mattel's iconic pink fashion doll line." },
        { name: "Twitch", slug: "twitch", color: "#9146FF", difficulty: 3, hint: "Leading video game live-streaming platform owned by Amazon." },
        // Level 4
        { name: "CNN", slug: "cnn", color: "#CC0000", difficulty: 4, hint: "First 24-hour cable news channel in the United States." },
        { name: "Paramount", slug: "paramount", color: "#006497", difficulty: 4, hint: "Studio using a logo of stars arching over a snowy mountain peak." },
        { name: "Steam", slug: "steam", color: "#000000", difficulty: 4, hint: "Valve's PC gaming platform; logo mimics a piston and crank mechanism." },
        { name: "Sega", slug: "sega", color: "#0089CF", difficulty: 4, hint: "Japanese gaming veteran that created Sonic the Hedgehog." },
        // Level 5
        { name: "Universal", slug: "universalpictures", color: "#000000", difficulty: 5, hint: "Studio whose opening sequence revolves around a spinning Earth." },
        { name: "DreamWorks", slug: "dreamworks", color: "#000000", difficulty: 5, hint: "Animation studio whose logo features a boy fishing from the crescent moon." },
        { name: "ESPN", slug: "espn", color: "#CC0000", difficulty: 5, hint: "Major US cable sports channel with a slashed-text red logo." },
        { name: "Epic Games", slug: "epicgames", color: "#000000", difficulty: 5, hint: "Creators of Unreal Engine, Fortnite, and the Epic Store." },
        // Level 6
        { name: "Minecraft", slug: "minecraft", color: "#141414", difficulty: 6, hint: "Best-selling sandbox block-building game of all time." },
        { name: "HBO", slug: "hbo", color: "#000000", difficulty: 6, hint: "Premium cable network behind Game of Thrones and The Sopranos." },
        { name: "Atari", slug: "atari", color: "#E01E26", difficulty: 6, hint: "Pioneered arcade and console gaming with Pong and the 2600." },
        { name: "Bandai Namco", slug: "bandainamco", color: "#FF003C", difficulty: 6, hint: "Japanese gaming publisher behind Pac-Man, Tekken, and Elden Ring." },
        // Level 7
        { name: "Blizzard", slug: "blizzardentertainment", color: "#00B4FF", difficulty: 7, hint: "Gaming studio behind Warcraft, Diablo, and Overwatch." },
        { name: "BBC", slug: "bbc", color: "#000000", difficulty: 7, hint: "British public broadcaster represented by three bold letters in squares." },
        { name: "MTV", slug: "mtv", color: "#000000", difficulty: 7, hint: "Music television channel that launched in 1981." },
        { name: "Rockstar Games", slug: "rockstargames", color: "#FCAF17", difficulty: 7, hint: "Developers of Grand Theft Auto and Red Dead Redemption." },
        // Level 8
        { name: "Duolingo", slug: "duolingo", color: "#58CC02", difficulty: 8, hint: "Gamified language learning app hosted by a passive-aggressive green owl." },
        { name: "Ubisoft", slug: "ubisoft", color: "#000000", difficulty: 8, hint: "French publisher of Assassin's Creed and Rainbow Six." },
        { name: "Electronic Arts", slug: "electronicarts", color: "#000000", difficulty: 8, hint: "Sports and gaming powerhouse, often stylized as 'EA Sports'." },
        { name: "Crunchyroll", slug: "crunchyroll", color: "#F47521", difficulty: 8, hint: "The world's largest anime streaming network, stylized as an orange eye." },
        // Level 9
        { name: "Riot Games", slug: "riotgames", color: "#D11F36", difficulty: 9, hint: "Developers of League of Legends and Valorant, logo is a punching fist." },
        { name: "Capcom", slug: "capcom", color: "#1D328C", difficulty: 9, hint: "Japanese gaming titan behind Resident Evil and Street Fighter." },
        { name: "Discord", slug: "discord", color: "#5865F2", difficulty: 9, hint: "Gamer-centric chat platform with an icon resembling a controller." },
        { name: "Hasbro", slug: "hasbro", color: "#007CC3", difficulty: 9, hint: "Toy giant behind Monopoly, Transformers, and Magic: The Gathering." },
        // Level 10
        { name: "A24", slug: "a24", color: "#000000", difficulty: 10, hint: "Independent cinema studio famed for Hereditary, Everything Everywhere All at Once." },
        { name: "Square Enix", slug: "squareenix", color: "#ED1C24", difficulty: 10, hint: "Creators of iconic JRPG series Final Fantasy and Kingdom Hearts." },
        { name: "CD Projekt Red", slug: "cdprojektred", color: "#FF0000", difficulty: 10, hint: "Polish developers of The Witcher series and Cyberpunk 2077." },
        { name: "Pokemon", slug: "pokemon", color: "#FFCB05", difficulty: 10, hint: "The highest-grossing media franchise of all time, created in Japan." }
    ]
};
