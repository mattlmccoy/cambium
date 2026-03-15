// ─── Region & Wood Species Narratives ───────────────────────────
// Story content for the brand-first store experience.
// Each region and species gets a short narrative to help customers
// connect with where their furniture comes from.

export interface RegionStory {
  headline: string;
  tagline: string;
  story: string;
  forestFact: string;
}

export interface SpeciesStory {
  origin: string;
  character: string;
  bestFor: string;
}

export const REGION_STORIES: Record<string, RegionStory> = {
  seattle: {
    headline: "Pacific Northwest Workshop",
    tagline: "Seattle, Washington",
    story: "Nestled between the Cascades and the Puget Sound, our PNW workshop draws from one of the most productive temperate forests on Earth. Douglas fir, Western red cedar, and bigleaf maple grow in abundance in sustainably managed timberlands stretching from Oregon to British Columbia.",
    forestFact: "Home to 25 million acres of managed timberland",
  },
  sacramento: {
    headline: "California Workshop",
    tagline: "Sacramento, California",
    story: "California's Central Valley workshop sits at the crossroads of the state's diverse forestlands — from the towering coast redwoods of the north to the prized Claro walnut orchards of the interior. Each board carries the warmth and character of California's unique growing conditions.",
    forestFact: "California manages over 33 million acres of forestland",
  },
  phoenix: {
    headline: "Southwest Workshop",
    tagline: "Phoenix, Arizona",
    story: "Our desert workshop specializes in the rugged, beautiful woods of the American Southwest. Mesquite, with its deep chocolate tones and extraordinary hardness, is salvaged from ranch land clearing — giving new life to wood that would otherwise be burned. Ponderosa pine descends from the high-elevation forests of the Mogollon Rim.",
    forestFact: "Arizona's mesquite forests cover over 8 million acres",
  },
  denver: {
    headline: "Rocky Mountain Workshop",
    tagline: "Denver, Colorado",
    story: "High in the Rockies, our Denver shop works with species shaped by altitude and arid conditions. Our signature material — beetle-kill blue pine — comes from trees lost to the mountain pine beetle epidemic. By milling this salvaged timber, we turn ecological loss into striking blue-streaked furniture.",
    forestFact: "Colorado salvages 100,000+ acres of beetle-kill timber annually",
  },
  austin: {
    headline: "Texas Workshop",
    tagline: "Austin, Texas",
    story: "Deep in the heart of Texas, our Austin workshop celebrates the hardwoods of the South Central region. Native pecan — a member of the hickory family — provides exceptional strength and a warm, nutty grain pattern. Bald cypress from the Gulf Coast bayous adds rot-resistant beauty with centuries of Southern heritage.",
    forestFact: "Texas is home to over 63 million acres of forestland",
  },
  minneapolis: {
    headline: "Upper Midwest Workshop",
    tagline: "Minneapolis, Minnesota",
    story: "Minnesota's workshop sits at the heart of America's northern hardwood belt. The Great North Woods provide an exceptional selection of classic furniture species — hard maple for its creamy white finish, yellow birch for its golden warmth, and red oak for its bold, open grain. These are the species that built American furniture tradition.",
    forestFact: "Minnesota's 17 million acres of forest are 53% hardwood",
  },
  chicago: {
    headline: "Great Lakes Workshop",
    tagline: "Chicago, Illinois",
    story: "Our Great Lakes workshop draws from the rich hardwood forests of the Midwest corridor. Black walnut — America's premier cabinet wood — grows in abundance across Illinois, Indiana, and Missouri. Cherry and hickory from these same forests offer everything from refined elegance to rugged country character.",
    forestFact: "The Great Lakes region produces 30% of US hardwood lumber",
  },
  pittsburgh: {
    headline: "Mid-Atlantic Workshop",
    tagline: "Pittsburgh, Pennsylvania",
    story: "Pennsylvania has been the heart of American furniture-making since colonial times. Our Pittsburgh workshop continues that tradition with locally sourced black cherry — the gold standard of American fine furniture — alongside white oak, yellow poplar, and the hardwoods of the Appalachian range.",
    forestFact: "Pennsylvania is the #1 US producer of hardwood lumber",
  },
  boston: {
    headline: "New England Workshop",
    tagline: "Boston, Massachusetts",
    story: "From the white pine forests of Maine to the hardwood hills of Vermont, New England's woodland heritage runs deep. Our Boston workshop builds with Eastern white pine — the wood of colonial ship masts and farmhouse tables — alongside beech, hard maple, and the full palette of northern hardwoods.",
    forestFact: "New England is 80% forested — the highest percentage since the 1800s",
  },
  atlanta: {
    headline: "Southeast Workshop",
    tagline: "Atlanta, Georgia",
    story: "The American South grows wood faster than anywhere in the temperate world. Our Atlanta workshop works with Southern yellow pine — the backbone of Southern construction — alongside rot-resistant cypress from the coastal lowlands and rich black walnut from the Piedmont uplands.",
    forestFact: "The US Southeast supplies 58% of the nation's wood products",
  },
};

export const SPECIES_STORIES: Record<string, SpeciesStory> = {
  "douglas-fir": {
    origin: "Sustainably harvested from managed forests in the Pacific Northwest Cascades",
    character: "Warm reddish-brown heartwood with a distinctive straight grain. Strong for its weight with a resinous, woodsy scent.",
    bestFor: "Tables and shelves — excellent strength-to-weight ratio with rustic warmth",
  },
  "western-red-cedar": {
    origin: "Pacific Northwest old-growth-adjacent managed stands, primarily from British Columbia and Washington",
    character: "Rich reddish-brown color that silvers gracefully with age. Naturally aromatic with exceptional rot resistance.",
    bestFor: "Shelves and accent tables — lightweight with a beautiful natural fragrance",
  },
  "bigleaf-maple": {
    origin: "Harvested from managed forests in Oregon and Washington's coastal ranges",
    character: "Creamy white to light gold with occasional dramatic figure (quilted, spalted, curly). One of the most visually striking domestic woods.",
    bestFor: "Side tables and chairs — stunning grain figure makes every piece unique",
  },
  "red-alder": {
    origin: "The most common hardwood in the Pacific Northwest, sustainably managed throughout Oregon and Washington",
    character: "Uniform reddish-brown tone with subtle grain. Takes stain exceptionally well and machines cleanly.",
    bestFor: "All furniture types — reliable, affordable, and beautifully even-toned",
  },
  "white-oak": {
    origin: "Found across eastern and central North America in well-managed hardwood forests",
    character: "Golden brown with distinctive ray fleck pattern in quarter-sawn cuts. Exceptionally durable and water-resistant.",
    bestFor: "Dining tables — the classic choice for furniture that will last generations",
  },
  "claro-walnut": {
    origin: "Sourced from California's Central Valley orchard removals and managed walnut groves",
    character: "Rich chocolate to purple-brown with dramatic swirling grain. California's answer to Eastern black walnut, often more figured.",
    bestFor: "Statement tables — the most visually dramatic wood in our collection",
  },
  "coast-redwood": {
    origin: "Sustainably harvested second-growth redwood from Northern California's managed timberlands",
    character: "Deep warm red heartwood with tight, straight grain. Naturally rot-resistant and dimensionally stable.",
    bestFor: "Shelves and tables — lightweight beauty with an ancient California heritage",
  },
  "incense-cedar": {
    origin: "From managed forests in California's Sierra Nevada foothills",
    character: "Light reddish-brown with a spicy, pencil-like aroma. Fine, even grain with natural pest resistance.",
    bestFor: "Shelves — naturally aromatic and beautifully straight-grained",
  },
  mesquite: {
    origin: "Salvaged from ranch land clearing and managed groves in Texas and Arizona",
    character: "Deep chocolate-brown with dramatic dark streaks and incredible hardness (Janka 2345). Dense, oily, and nearly indestructible.",
    bestFor: "Tables — a conversation piece with extreme durability and Southwest character",
  },
  "ponderosa-pine": {
    origin: "Harvested from managed forests in Arizona's high-country Mogollon Rim",
    character: "Warm honey-gold with prominent growth rings and occasional knots. Light, workable, and pleasantly resinous.",
    bestFor: "Shelves and side tables — affordable warmth with a Western character",
  },
  "beetle-kill-pine": {
    origin: "Salvaged from Colorado's beetle-kill epidemic — turning ecological loss into beautiful furniture",
    character: "Distinctive blue-gray streaks through honey-toned pine from the beetle's blue-stain fungus. Each board tells a story of forest renewal.",
    bestFor: "All types — unique blue-streaked grain makes every piece a conversation starter",
  },
  aspen: {
    origin: "From Colorado's mountain groves — the most widely distributed tree in North America",
    character: "Creamy white to pale yellow with a subtle grain. Light, soft, and clean-cutting.",
    bestFor: "Chairs and side tables — clean Scandinavian aesthetic at an accessible price",
  },
  pecan: {
    origin: "Sourced from Texas pecan orchards and managed stands across the South Central US",
    character: "Warm brown with dramatic grain variation between heartwood and sapwood. A member of the hickory family with exceptional strength.",
    bestFor: "Dining tables and chairs — Southern strength meets warm, nutty beauty",
  },
  "bald-cypress": {
    origin: "From managed stands in Gulf Coast bayous and East Texas bottomlands",
    character: "Warm tan to rich brown with distinctive wood grain. Naturally rot-resistant — thrives in swamp water and coastal humidity.",
    bestFor: "Tables and shelves — Southern heritage with natural weather resistance",
  },
  "hard-maple": {
    origin: "From the northern hardwood forests of Minnesota, Wisconsin, and Michigan",
    character: "Creamy white to light amber with a fine, tight grain. Extremely hard and resistant to wear — the wood of bowling alleys and butcher blocks.",
    bestFor: "Dining tables and chairs — clean, bright, and incredibly durable",
  },
  "yellow-birch": {
    origin: "Harvested from managed forests in Minnesota, Wisconsin, and New England",
    character: "Golden to reddish-brown with a satiny sheen. Fine-grained with a distinctive wintergreen scent when cut.",
    bestFor: "Tables and chairs — warm golden tones with excellent finishing properties",
  },
  "red-oak": {
    origin: "The most abundant hardwood in North America, sustainably managed across the eastern US",
    character: "Pink to reddish-brown with a bold, open grain pattern. Strong, affordable, and distinctly American.",
    bestFor: "All furniture — the classic American hardwood at an excellent value",
  },
  basswood: {
    origin: "From managed stands throughout the Upper Midwest",
    character: "Pale creamy white with a very fine, even grain. Exceptionally soft and easy to carve.",
    bestFor: "Side tables and shelves — lightweight and affordable with a clean, minimal look",
  },
  "black-walnut": {
    origin: "From managed woodlands across the Midwest and Mid-Atlantic — America's premium furniture wood",
    character: "Rich chocolate brown to purple-black with elegant flowing grain. Develops a warm patina with age.",
    bestFor: "Dining tables — the gold standard of American fine furniture",
  },
  cherry: {
    origin: "From the hardwood forests of Pennsylvania, Ohio, and New York",
    character: "Warm reddish-brown that deepens dramatically with sunlight exposure. Fine, tight grain with a satiny natural sheen.",
    bestFor: "All furniture — ages beautifully, developing rich color over years",
  },
  hickory: {
    origin: "From managed hardwood forests across the Midwest and Appalachia",
    character: "Dramatic contrast between pale sapwood and dark heartwood. The hardest common North American hardwood.",
    bestFor: "Chairs and tables — rustic character with virtually indestructible strength",
  },
  "black-cherry": {
    origin: "Sourced from Pennsylvania's Allegheny Plateau — the finest cherry-growing region in the world",
    character: "Warm pink to deep reddish-brown, richening with age. Fine-grained with delicate figure and a natural luster.",
    bestFor: "Tables and chairs — Pennsylvania's signature fine furniture wood",
  },
  "yellow-poplar": {
    origin: "The tallest eastern hardwood, abundant across the Appalachian region",
    character: "Pale cream to yellow-green with subtle streaks. Clean, straight grain that takes paint and stain exceptionally well.",
    bestFor: "Shelves and side tables — the most affordable hardwood with a clean, modern aesthetic",
  },
  "eastern-white-pine": {
    origin: "From the forests of Maine, New Hampshire, and Vermont — New England's heritage wood",
    character: "Warm cream to honey gold with prominent growth rings and occasional knots. Soft, fragrant, and steeped in American history.",
    bestFor: "Tables and shelves — colonial warmth at New England's most accessible price",
  },
  beech: {
    origin: "From managed hardwood forests throughout New England and the Mid-Atlantic",
    character: "Pale cream to light brown with tiny, distinctive flecks. Hard, dense, and exceptional for steam-bending.",
    bestFor: "Chairs — the traditional European chair wood, prized for its bending properties",
  },
  "southern-yellow-pine": {
    origin: "From managed pine plantations across the American Southeast — the most planted timber species in the US",
    character: "Warm yellow to amber with bold grain patterns. Resinous, strong, and fast-growing.",
    bestFor: "Tables and shelves — Southern character at the most accessible price point",
  },
  cypress: {
    origin: "From coastal lowlands and river bottoms across the Southeast US",
    character: "Pale honey to warm brown with straight grain. Naturally rot-resistant — the wood of Southern porches and river docks.",
    bestFor: "Shelves and tables — naturally weather-resistant with coastal Southern character",
  },
};
