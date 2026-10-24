/**
 * Xazina Ovchisi - Level System & Map Definitions
 * 5 levels with increasing difficulty, defined as 2D arrays.
 */

export const TILE_SIZE = 40;

// Color Palette specified in design requirements
export const COLORS = {
    sand: '#F4D58D',
    sandDark: '#E4BF72',
    sea: '#2A9D8F',
    seaDeep: '#1F756B',
    seaWave: '#48CAE4',
    grass: '#6BA368',
    grassDark: '#548252',
    soil: '#8B5E3C',
    soilDark: '#674226',
    soilLight: '#A67852',
    gold: '#FFC93C',
    goldLight: '#FFE17D',
    goldDark: '#D49B1E',
    dangerRed: '#E63946',
    darkUI: '#1D3557',
    // Fantastic Supernatural Palette
    portalCyan: '#00F5D4',
    portalPurple: '#7B2CBF',
    magicViolet: '#9D4EDD',
    magicBlue: '#48CAE4',
    magicPink: '#F72585'
};

/**
 * 5 Pre-defined levels with 2D character arrays:
 * 'W' = Wall / Rock / Barrier (solid)
 * '.' = Sand / Walkable path
 * 'P' = Player spawn
 * 'K' = Exactly one Key (unlocks the door)
 * 'D' = Exit Door
 * 'C' = Coin (+10 points)
 * 'T' = Treasure chest (+50 points)
 * 'S' = Spike trap (-1 life)
 * 'E' = Patrolling pirate enemy (-1 life)
 * 'G' = Ghost Pirate (Fantastic floating ethereal enemy)
 * '1','2' = Astral Teleportation Portals (warps player instantly)
 * 'O' = Magic Shield Crystal (absorbs 1 damage hit)
 * 'B' = Chrono Hourglass (slows time for 5 seconds)
 * 'A' = Arcane Amulet (+2 Magic Fireball ammo)
 */
export const LEVELS = [
    // Level 1: Sohilga qadam (Beach Landing) - 16x11
    {
        id: 1,
        name: "1-bosqich: Sohilga qadam",
        enemySpeed: 38,
        detectionRadius: 85,
        grid: [
            ['W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W'],
            ['W','.','P','.','C','.','C','.','C','.','C','.','.','.','.','W'],
            ['W','.','W','W','W','W','W','.','W','W','W','W','W','W','.','W'],
            ['W','.','W','.','O','.','W','.','W','.','.','A','.','W','.','W'],
            ['W','.','W','.','T','.','W','.','W','.','K','.','.','W','.','W'],
            ['W','.','W','.','.','.','W','.','W','W','W','W','.','W','.','W'],
            ['W','.','W','W','.','W','W','.','.','.','.','.','.','W','.','W'],
            ['W','.','.','C','.','.','.','.','E','.','.','C','.','.','.','W'],
            ['W','W','W','W','W','W','W','.','W','W','W','W','W','W','.','W'],
            ['W','.','.','S','.','.','.','C','.','.','C','.','.','D','.','W'],
            ['W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W']
        ]
    },
    // Level 2: Qaroqchi Qoyalari (Pirate Coves) - 17x11
    {
        id: 2,
        name: "2-bosqich: Qaroqchi Qoyalari",
        enemySpeed: 42,
        detectionRadius: 90,
        grid: [
            ['W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W'],
            ['W','1','P','.','C','.','.','.','W','.','C','.','C','.','.','2','W'],
            ['W','.','W','W','W','.','W','.','W','.','W','W','W','W','W','.','W'],
            ['W','.','.','M','W','.','W','.','.','.','W','.','.','.','T','.','W'],
            ['W','W','W','.','W','.','W','W','W','.','W','.','W','W','W','.','W'],
            ['W','.','.','.','C','.','.','.','.','.','O','.','C','.','.','.','W'],
            ['W','.','W','W','W','W','W','.','W','W','W','W','W','.','W','.','W'],
            ['W','.','W','.','.','.','W','.','E','.','.','.','W','.','W','.','W'],
            ['W','.','W','.','T','.','W','.','W','W','W','.','W','.','K','.','W'],
            ['W','.','.','.','C','.','.','.','.','.','S','.','.','.','D','.','W'],
            ['W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W']
        ]
    },
    // Level 3: Sirli G'or (Mysterious Cave) - 18x12
    {
        id: 3,
        name: "3-bosqich: Sirli G'or",
        enemySpeed: 46,
        detectionRadius: 95,
        grid: [
            ['W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W'],
            ['W','.','P','.','C','.','W','.','.','.','C','.','C','.','.','C','.','W'],
            ['W','.','W','W','W','.','W','.','W','W','W','W','W','W','W','W','.','W'],
            ['W','.','O','.','W','.','.','.','W','.','.','B','.','T','.','W','.','W'],
            ['W','W','W','.','W','W','W','W','W','.','W','W','W','W','.','W','.','W'],
            ['W','.','.','.','C','.','.','.','E','.','.','.','.','C','.','.','.','W'],
            ['W','.','W','W','W','W','W','W','.','S','.','W','W','W','W','W','.','W'],
            ['W','.','W','.','M','.','.','W','.','.','.','W','.','.','.','W','.','W'],
            ['W','.','W','.','T','.','.','W','W','W','W','W','.','K','.','W','.','W'],
            ['W','.','W','.','.','.','.','.','.','.','.','E','.','.','.','W','.','W'],
            ['W','.','.','.','S','.','.','W','W','W','W','W','W','W','.','D','.','W'],
            ['W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W']
        ]
    },
    // Level 4: Qadimiy Harobalar (Ancient Ruins) - 20x13
    {
        id: 4,
        name: "4-bosqich: Qadimiy Harobalar",
        enemySpeed: 50,
        detectionRadius: 100,
        grid: [
            ['W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W'],
            ['W','1','P','.','C','.','.','.','C','.','.','.','W','.','O','.','.','T','.','W'],
            ['W','W','W','W','W','W','W','.','W','W','W','.','W','.','W','W','W','W','.','W'],
            ['W','.','.','.','C','.','W','.','.','.','W','.','W','.','C','.','.','W','.','W'],
            ['W','.','W','.','I','.','W','W','.','.','W','.','W','W','W','W','.','W','.','W'],
            ['W','.','W','.','T','.','.','E','.','.','W','.','.','.','.','W','.','W','.','W'],
            ['W','.','W','W','W','W','W','W','W','.','W','.','.','S','.','W','.','W','.','W'],
            ['W','.','W','.','.','.','K','.','W','.','.','.','W','W','.','.','.','W','2','W'],
            ['W','.','W','.','W','W','W','.','W','W','W','W','W','.','W','W','W','W','.','W'],
            ['W','.','.','.','W','.','.','.','E','.','.','.','W','.','G','.','.','.','.','W'],
            ['W','W','W','.','W','.','S','.','W','W','W','.','W','.','S','.','W','W','W','W'],
            ['W','A','.','.','C','.','.','.','.','.','W','.','B','.','C','.','.','D','.','W'],
            ['W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W']
        ]
    },
    // Level 5: Yashirin Zindon (Sunken Dungeon) - 22x13
    {
        id: 5,
        name: "5-bosqich: Yashirin Zindon",
        enemySpeed: 54,
        detectionRadius: 105,
        grid: [
            ['W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W'],
            ['W','.','P','.','.','.','W','.','.','.','C','.','.','.','.','W','.','.','.','T','.','W'],
            ['W','.','W','W','W','.','W','.','W','W','W','W','W','W','.','W','.','W','W','W','.','W'],
            ['W','.','.','.','W','.','.','.','W','.','.','.','.','W','.','.','.','W','.','.','.','W'],
            ['W','W','W','.','W','W','W','W','W','.','S','.','.','W','W','W','W','W','.','W','W','W'],
            ['W','.','.','.','C','.','.','.','E','.','.','.','.','C','.','.','.','E','.','.','.','W'],
            ['W','.','W','W','W','W','W','.','W','W','W','W','W','W','.','W','W','W','W','W','.','W'],
            ['W','.','.','.','T','.','W','.','.','.','K','.','.','.','.','W','.','T','.','.','.','W'],
            ['W','W','W','W','W','.','W','.','W','W','W','W','W','W','.','W','.','W','W','W','W','W'],
            ['W','.','.','.','W','.','.','.','W','.','S','.','.','W','.','.','.','W','.','.','.','W'],
            ['W','.','E','.','W','.','W','W','W','.','.','.','.','W','W','W','.','W','.','G','.','W'],
            ['W','.','A','.','C','.','.','.','S','.','.','.','C','.','.','.','.','S','.','D','.','W'],
            ['W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W']
        ]
    },
    // Level 6: Qaroqchilar Qal'asi (Pirate Fortress) - 22x14
    {
        id: 6,
        name: "6-bosqich: Qaroqchilar Qal'asi",
        enemySpeed: 58,
        detectionRadius: 110,
        grid: [
            ['W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W'],
            ['W','1','P','.','O','.','W','.','.','.','C','.','.','.','.','W','.','.','.','T','.','W'],
            ['W','.','W','W','W','.','W','.','W','W','W','W','W','W','.','W','.','W','W','W','.','W'],
            ['W','.','.','.','W','.','.','.','W','.','.','.','.','W','.','.','.','W','.','.','.','W'],
            ['W','W','W','.','W','W','W','W','W','.','S','.','.','W','W','W','W','W','.','W','W','W'],
            ['W','.','.','.','C','.','.','.','E','.','.','.','.','C','.','.','.','E','.','.','.','W'],
            ['W','.','W','W','W','W','W','.','W','W','W','W','W','W','.','W','W','W','W','W','.','W'],
            ['W','.','.','.','T','.','W','.','.','.','K','.','.','.','.','W','.','T','.','.','2','W'],
            ['W','W','W','W','W','.','W','.','W','W','W','W','W','W','.','W','.','W','W','W','W','W'],
            ['W','.','.','.','W','.','.','.','W','.','S','.','.','W','.','.','.','W','.','.','.','W'],
            ['W','.','G','.','W','.','W','W','W','.','.','.','.','W','W','W','.','W','.','G','.','W'],
            ['W','.','A','.','W','.','.','.','W','.','B','.','.','W','.','.','.','W','.','.','.','W'],
            ['W','.','C','.','.','.','S','.','.','.','C','.','.','.','.','S','.','.','.','D','.','W'],
            ['W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W']
        ]
    },
    // Level 7: Sharpalar Qabristoni (Phantom Graveyard) - 24x14
    {
        id: 7,
        name: "7-bosqich: Sharpalar Qabristoni",
        enemySpeed: 62,
        detectionRadius: 115,
        grid: [
            ['W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W'],
            ['W','1','P','.','.','.','.','.','W','.','.','.','C','.','.','.','.','W','.','.','.','.','2','W'],
            ['W','W','W','W','W','W','W','.','W','.','W','W','W','W','W','W','.','W','.','W','W','W','.','W'],
            ['W','.','.','.','T','.','W','.','.','.','W','.','T','.','.','W','.','.','.','W','.','T','.','W'],
            ['W','.','W','W','W','.','W','W','W','W','W','.','W','W','.','W','W','W','W','W','.','W','.','W'],
            ['W','.','O','.','W','.','.','.','G','.','.','.','.','W','.','.','.','E','.','.','.','W','.','W'],
            ['W','W','W','.','W','.','S','.','W','W','W','W','W','W','W','W','W','W','.','S','.','W','.','W'],
            ['W','.','.','.','W','.','.','.','W','.','.','.','.','K','.','.','.','W','.','.','.','W','.','W'],
            ['W','.','W','W','W','W','W','.','W','.','W','W','W','W','W','W','.','W','.','W','W','W','.','W'],
            ['W','.','.','.','G','.','.','.','W','.','.','.','G','.','.','.','.','W','.','.','.','G','.','W'],
            ['W','.','W','W','W','W','W','.','W','W','W','W','W','W','W','W','.','W','W','W','W','W','.','W'],
            ['W','.','W','.','.','.','W','.','A','.','S','.','.','S','.','.','B','W','.','.','.','W','.','W'],
            ['W','.','A','.','C','.','.','.','.','.','.','.','C','.','.','.','.','.','.','.','.','D','.','W'],
            ['W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W']
        ]
    },
    // Level 8: Lava Qoyalari (Molten Cavern) - 24x15
    {
        id: 8,
        name: "8-bosqich: Lava Qoyalari",
        enemySpeed: 66,
        detectionRadius: 120,
        grid: [
            ['W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W'],
            ['W','.','P','.','C','.','.','.','W','.','C','.','.','.','W','.','.','.','C','.','T','.','.','W'],
            ['W','.','W','W','W','W','W','.','W','.','W','W','W','.','W','.','W','W','W','W','W','W','.','W'],
            ['W','.','W','.','.','.','W','.','.','.','W','.','.','.','W','.','W','.','.','.','O','.','.','W'],
            ['W','.','W','.','T','.','W','W','W','W','W','.','T','.','W','.','W','.','K','.','W','W','.','W'],
            ['W','.','W','W','.','W','W','.','.','.','W','W','.','W','W','.','W','W','W','W','W','.','.','W'],
            ['W','.','.','.','S','.','.','.','E','.','.','.','S','.','.','.','E','.','.','.','W','.','.','W'],
            ['W','W','W','W','W','W','W','.','W','W','W','W','W','W','W','.','W','W','W','.','W','.','.','W'],
            ['W','.','.','.','.','.','W','.','W','.','.','.','.','.','W','.','W','.','.','.','W','.','.','W'],
            ['W','.','G','.','.','.','W','.','W','.','B','.','.','.','W','.','W','.','G','.','W','.','.','W'],
            ['W','W','W','W','W','.','W','.','W','W','W','W','W','.','W','.','W','.','W','W','W','.','.','W'],
            ['W','.','.','.','W','.','.','.','.','.','.','.','W','.','.','.','W','.','W','.','.','.','.','W'],
            ['W','.','A','.','W','W','W','W','W','.','S','.','W','W','W','W','W','.','W','.','S','.','.','W'],
            ['W','.','C','.','.','.','.','.','C','.','.','.','.','.','.','.','C','.','.','.','D','.','.','W'],
            ['W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W']
        ]
    },
    // Level 9: Kapitan Qo'rg'oni (Captain's Keep) - 26x15
    {
        id: 9,
        name: "9-bosqich: Kapitan Qo'rg'oni",
        enemySpeed: 70,
        detectionRadius: 125,
        grid: [
            ['W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W'],
            ['W','1','P','.','C','.','W','.','.','.','.','.','W','.','.','.','.','W','.','.','.','C','.','.','2','W'],
            ['W','.','W','W','W','.','W','.','W','W','W','W','W','.','W','W','W','W','.','W','W','W','W','W','.','W'],
            ['W','.','.','.','W','.','W','.','W','.','.','.','W','.','W','.','.','.','.','W','.','.','.','T','.','W'],
            ['W','W','W','.','W','.','W','.','W','.','T','.','W','.','W','.','T','.','.','W','.','W','W','W','.','W'],
            ['W','.','.','.','C','.','.','.','W','W','.','W','W','.','W','W','.','W','W','W','.','W','.','.','.','W'],
            ['W','.','W','W','W','W','W','.','.','.','E','.','.','.','.','.','E','.','.','.','.','W','.','W','.','W'],
            ['W','.','W','.','.','.','W','W','W','W','W','.','W','W','W','W','W','.','W','W','W','W','.','W','.','W'],
            ['W','.','W','.','O','.','.','.','.','.','W','.','W','.','.','.','.','.','W','.','.','.','.','W','.','W'],
            ['W','.','W','W','W','W','W','.','G','.','W','.','W','.','G','.','.','.','W','.','K','.','.','W','.','W'],
            ['W','.','.','.','.','.','W','W','W','.','W','.','W','.','W','W','W','W','W','.','W','W','W','W','.','W'],
            ['W','W','W','.','S','.','.','.','W','.','.','.','.','.','W','.','.','.','S','.','W','.','.','.','.','W'],
            ['W','.','.','.','C','.','A','.','W','W','W','W','W','W','W','.','B','.','C','.','W','.','S','.','.','W'],
            ['W','.','C','.','.','.','S','.','.','.','.','.','.','.','.','.','.','.','S','.','.','.','D','.','.','W'],
            ['W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W']
        ]
    },
    // Level 10: Afsonaviy Xazinaxona (The Legendary Vault) - 28x16 (Final Boss Realm)
    {
        id: 10,
        name: "10-bosqich: Afsonaviy Xazinaxona",
        enemySpeed: 75,
        detectionRadius: 130,
        grid: [
            ['W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W'],
            ['W','1','P','.','.','.','.','.','W','.','.','.','C','.','.','.','.','W','.','.','.','.','.','W','.','.','2','W'],
            ['W','W','W','W','W','W','W','.','W','.','W','W','W','W','W','W','.','W','.','W','W','W','.','W','.','W','W','W'],
            ['W','.','.','.','T','.','W','.','.','.','W','.','T','.','.','W','.','.','.','W','.','T','.','W','.','.','.','W'],
            ['W','.','W','W','W','.','W','W','W','W','W','.','W','W','.','W','W','W','W','W','.','W','.','W','W','W','.','W'],
            ['W','.','O','.','W','.','.','.','G','.','.','.','.','W','.','.','.','E','.','.','.','W','.','.','.','O','.','W'],
            ['W','W','W','.','W','.','S','.','W','W','W','W','W','W','W','W','W','W','.','S','.','W','.','W','W','W','.','W'],
            ['W','.','.','.','W','.','.','.','W','.','.','.','.','K','.','.','.','W','.','.','.','W','.','W','.','.','.','W'],
            ['W','.','W','W','W','W','W','.','W','.','W','W','W','W','W','W','.','W','.','W','W','W','.','W','.','W','W','W'],
            ['W','.','.','.','G','.','.','.','W','.','.','.','G','.','.','.','.','W','.','.','.','G','.','W','.','.','.','W'],
            ['W','.','W','W','W','W','W','.','W','W','W','W','W','W','W','W','.','W','W','W','W','W','.','W','W','W','.','W'],
            ['W','.','W','.','.','.','W','.','A','.','S','.','.','S','.','.','B','W','.','.','.','W','.','.','.','A','.','W'],
            ['W','.','W','.','T','.','W','W','W','W','W','W','W','W','W','W','W','W','.','T','.','W','W','W','W','W','.','W'],
            ['W','.','W','.','.','.','.','.','.','C','.','.','.','.','C','.','.','.','.','.','.','W','.','.','.','.','.','W'],
            ['W','.','.','.','C','.','S','.','.','.','T','.','T','.','T','.','.','.','S','.','.','.','.','.','.','D','.','W'],
            ['W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W']
        ]
    }
];


export class Level {
    constructor() {
        this.currentLevelIndex = 0;
        this.name = "";
        this.cols = 0;
        this.rows = 0;
        this.pixelWidth = 0;
        this.pixelHeight = 0;

        this.grid = [];
        this.playerSpawn = { x: 0, y: 0 };
        this.key = null;
        this.exitDoor = null;
        this.coins = [];
        this.chests = [];
        this.spikes = [];
        this.rawEnemyData = [];

        // === FANTASTIC SUPERNATURAL OBJECTS ===
        this.portals = [];
        this.shields = [];
        this.timeArtifacts = [];
        this.magicAmulets = [];
        this.magnets = [];
        this.invisibilityCloaks = [];
        this.portalAnimAngle = 0;

        this.animTime = 0;
    }

    /**
     * Loads a level by index (0-based: 0 to 4).
     */
    load(index) {
        if (index < 0 || index >= LEVELS.length) {
            index = 0;
        }
        this.currentLevelIndex = index;
        const levelData = LEVELS[index];

        this.name = levelData.name;
        this.rows = levelData.grid.length;
        this.cols = levelData.grid[0].length;
        this.pixelWidth = this.cols * TILE_SIZE;
        this.pixelHeight = this.rows * TILE_SIZE;

        this.grid = [];
        this.coins = [];
        this.chests = [];
        this.spikes = [];
        this.rawEnemyData = [];
        this.portals = [];
        this.shields = [];
        this.timeArtifacts = [];
        this.magicAmulets = [];
        this.magnets = [];
        this.invisibilityCloaks = [];
        this.key = null;
        this.exitDoor = null;

        for (let r = 0; r < this.rows; r++) {
            const rowArr = [];
            for (let c = 0; c < this.cols; c++) {
                const cell = levelData.grid[r][c];
                const cx = c * TILE_SIZE + TILE_SIZE / 2;
                const cy = r * TILE_SIZE + TILE_SIZE / 2;

                if (cell === 'W') {
                    rowArr.push('W');
                } else {
                    rowArr.push('.'); // Walkable floor base
                }

                if (cell === 'P') {
                    this.playerSpawn = { x: cx, y: cy };
                } else if (cell === 'K') {
                    this.key = {
                        col: c,
                        row: r,
                        x: cx,
                        y: cy,
                        width: 24,
                        height: 24,
                        collected: false,
                        floatTimer: 0
                    };
                } else if (cell === 'D') {
                    this.exitDoor = {
                        col: c,
                        row: r,
                        x: c * TILE_SIZE,
                        y: r * TILE_SIZE,
                        width: TILE_SIZE,
                        height: TILE_SIZE,
                        unlocked: false
                    };
                } else if (cell === 'C') {
                    this.coins.push({
                        col: c,
                        row: r,
                        x: cx,
                        y: cy,
                        radius: 10,
                        collected: false,
                        spinAngle: Math.random() * Math.PI * 2
                    });
                } else if (cell === 'T') {
                    this.chests.push({
                        col: c,
                        row: r,
                        x: c * TILE_SIZE + 4,
                        y: r * TILE_SIZE + 6,
                        width: 32,
                        height: 28,
                        opened: false,
                        openProgress: 0, // 0 = closed, 1 = fully open
                        glowTimer: 0
                    });
                } else if (cell === 'S') {
                    this.spikes.push({
                        col: c,
                        row: r,
                        x: c * TILE_SIZE,
                        y: r * TILE_SIZE,
                        width: TILE_SIZE,
                        height: TILE_SIZE,
                        timer: (c + r) * 0.4 % 3.0, // Stagger spikes naturally
                        cycleTime: 3.0,             // 3s full cycle
                        activeDuration: 1.6,        // Extended for 1.6s
                        warningDuration: 0.5,       // Warning gleam for 0.5s before
                        state: 'down'               // 'down', 'warning', 'up'
                    });
                } else if (cell === '1' || cell === '2') {
                    this.portals.push({
                        id: cell,
                        col: c,
                        row: r,
                        x: cx,
                        y: cy,
                        radius: 16,
                        target: null
                    });
                } else if (cell === 'O') {
                    this.shields.push({
                        col: c,
                        row: r,
                        x: cx,
                        y: cy,
                        radius: 14,
                        collected: false,
                        floatTimer: Math.random() * Math.PI * 2
                    });
                } else if (cell === 'B') {
                    this.timeArtifacts.push({
                        col: c,
                        row: r,
                        x: cx,
                        y: cy,
                        radius: 14,
                        collected: false,
                        floatTimer: Math.random() * Math.PI * 2
                    });
                } else if (cell === 'A') {
                    this.magicAmulets.push({
                        col: c,
                        row: r,
                        x: cx,
                        y: cy,
                        radius: 14,
                        collected: false,
                        floatTimer: Math.random() * Math.PI * 2
                    });
                } else if (cell === 'M') {
                    this.magnets.push({
                        col: c,
                        row: r,
                        x: cx,
                        y: cy,
                        radius: 14,
                        collected: false,
                        floatTimer: Math.random() * Math.PI * 2
                    });
                } else if (cell === 'I') {
                    this.invisibilityCloaks.push({
                        col: c,
                        row: r,
                        x: cx,
                        y: cy,
                        radius: 14,
                        collected: false,
                        floatTimer: Math.random() * Math.PI * 2
                    });
                } else if (cell === 'E' || cell === 'G') {
                    // Determine natural patrol bounds based on corridor
                    let leftBound = c;
                    while (leftBound > 0 && levelData.grid[r][leftBound - 1] !== 'W') {
                        leftBound--;
                    }
                    let rightBound = c;
                    while (rightBound < this.cols - 1 && levelData.grid[r][rightBound + 1] !== 'W') {
                        rightBound++;
                    }

                    let topBound = r;
                    while (topBound > 0 && levelData.grid[topBound - 1][c] !== 'W') {
                        topBound--;
                    }
                    let bottomBound = r;
                    while (bottomBound < this.rows - 1 && levelData.grid[bottomBound + 1][c] !== 'W') {
                        bottomBound++;
                    }

                    const horizRange = rightBound - leftBound;
                    const vertRange = bottomBound - topBound;

                    // Choose axis with longer walking corridor
                    const axis = horizRange >= vertRange ? 'horizontal' : 'vertical';
                    const minCoord = (axis === 'horizontal' ? leftBound : topBound) * TILE_SIZE + 20;
                    const maxCoord = (axis === 'horizontal' ? rightBound : bottomBound) * TILE_SIZE + 20;

                    this.rawEnemyData.push({
                        col: c,
                        row: r,
                        x: cx,
                        y: cy,
                        axis,
                        minCoord,
                        maxCoord,
                        detectionRadius: cell === 'G' ? 95 : (levelData.detectionRadius || 100),
                        isGhost: (cell === 'G'),
                        speed: cell === 'G' ? (levelData.enemySpeed || 50) * 0.85 : (levelData.enemySpeed || 50)
                    });
                }
            }
            this.grid.push(rowArr);
        }

        // Link portal pairs
        const p1 = this.portals.find(p => p.id === '1');
        const p2 = this.portals.find(p => p.id === '2');
        if (p1 && p2) {
            p1.target = p2;
            p2.target = p1;
        }

        // Pre-render static tilemap onto offscreen canvas for solid 60 FPS on low-end hardware
        this.buildTilemapCache();
    }

    /**
     * Pre-renders all static sand and wall tiles to an offscreen canvas.
     * Eliminates 2,000+ per-frame fillRect calls down to 1 single hardware blit!
     */
    buildTilemapCache() {
        this.bgCanvas = document.createElement('canvas');
        this.bgCanvas.width = this.pixelWidth;
        this.bgCanvas.height = this.pixelHeight;
        const bgCtx = this.bgCanvas.getContext('2d');
        bgCtx.imageSmoothingEnabled = false;

        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const px = c * TILE_SIZE;
                const py = r * TILE_SIZE;
                if (this.grid[r][c] === 'W') {
                    this.drawWallTile(bgCtx, px, py, c, r);
                } else {
                    this.drawSandTile(bgCtx, px, py, c, r);
                }
            }
        }
    }

    /**
     * Checks if a point or grid coordinate is a solid wall.
     */
    isSolidTile(col, row) {
        if (col < 0 || col >= this.cols || row < 0 || row >= this.rows) {
            return true;
        }
        return this.grid[row][col] === 'W';
    }

    /**
     * Checks if an AABB rectangle overlaps any solid wall tiles.
     */
    checkWallCollision(box) {
        const minCol = Math.floor(box.x / TILE_SIZE);
        const maxCol = Math.floor((box.x + box.width - 0.01) / TILE_SIZE);
        const minRow = Math.floor(box.y / TILE_SIZE);
        const maxRow = Math.floor((box.y + box.height - 0.01) / TILE_SIZE);

        for (let r = minRow; r <= maxRow; r++) {
            for (let c = minCol; c <= maxCol; c++) {
                if (this.isSolidTile(c, r)) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * Updates animations for level objects.
     */
    update(dt) {
        this.animTime += dt;

        // Animate coins (spinning)
        this.coins.forEach(coin => {
            if (!coin.collected) {
                coin.spinAngle = (coin.spinAngle + dt * 4.5) % (Math.PI * 2);
            }
        });

        // Animate key floating bob
        if (this.key && !this.key.collected) {
            this.key.floatTimer += dt * 3.5;
        }

        // Animate chests opening
        this.chests.forEach(chest => {
            if (chest.opened && chest.openProgress < 1) {
                chest.openProgress = Math.min(1, chest.openProgress + dt * 3.5);
            }
            if (chest.opened) {
                chest.glowTimer += dt * 4;
            }
        });

        // Animate periodic spike traps
        this.spikes.forEach(spike => {
            spike.timer = (spike.timer + dt) % spike.cycleTime;
            const warningStart = spike.cycleTime - spike.activeDuration - spike.warningDuration;
            const upStart = spike.cycleTime - spike.activeDuration;

            if (spike.timer >= upStart) {
                spike.state = 'up';
            } else if (spike.timer >= warningStart) {
                spike.state = 'warning';
            } else {
                spike.state = 'down';
            }
        });

        // === FANTASTIC OBJECT ANIMATIONS ===
        // 1. Animate Astral Portals
        this.portalAnimAngle = (this.portalAnimAngle + dt * 4.5) % (Math.PI * 2);

        // 2. Animate Magic Shield Crystals
        this.shields.forEach(s => {
            if (!s.collected) {
                s.floatTimer += dt * 3.5;
            }
        });

        // 3. Animate Chrono Hourglasses
        this.timeArtifacts.forEach(t => {
            if (!t.collected) {
                t.floatTimer += dt * 3.5;
            }
        });

        // 4. Animate Arcane Amulets
        this.magicAmulets.forEach(a => {
            if (!a.collected) {
                a.floatTimer += dt * 3.5;
            }
        });

        // 5. Animate Cosmic Magnets
        this.magnets.forEach(m => {
            if (!m.collected) {
                m.floatTimer += dt * 3.5;
            }
        });

        // 6. Animate Invisibility Cloaks
        this.invisibilityCloaks.forEach(ic => {
            if (!ic.collected) {
                ic.floatTimer += dt * 3.5;
            }
        });
    }

    /**
     * Unlocks the exit door when key is picked up.
     */
    unlockExitDoor() {
        if (this.exitDoor) {
            this.exitDoor.unlocked = true;
        }
    }

    /**
     * Renders the tilemap and static/animated level entities.
     */
    render(ctx, camera) {
        // 1. Draw Animated Tropical Ocean Viewport (Fills whole screen seamless)
        ctx.fillStyle = '#1D7068';
        ctx.fillRect(0, 0, camera.viewportWidth, camera.viewportHeight);

        // Gentle animated waves (ultra-fast, zero CPU lag)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.lineWidth = 2;
        const waveY = (this.animTime * 20) % 50;
        for (let wy = -50 + waveY; wy < camera.viewportHeight + 50; wy += 35) {
            ctx.beginPath();
            ctx.moveTo(0, wy);
            ctx.quadraticCurveTo(camera.viewportWidth * 0.5, wy + 6, camera.viewportWidth, wy);
            ctx.stroke();
        }

        // 2. Draw Island Sandy Shoreline & Sea Foam Border
        const ix = -camera.x;
        const iy = -camera.y;
        const iw = this.pixelWidth;
        const ih = this.pixelHeight;

        // Sea foam fringe
        ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.fillRect(ix - 8, iy - 8, iw + 16, ih + 16);

        // Shallow water halo
        ctx.fillStyle = 'rgba(42, 157, 143, 0.5)';
        ctx.fillRect(ix - 4, iy - 4, iw + 8, ih + 8);

        // 3. Draw Static Island Tilemap (Single GPU hardware blit - 60 FPS!)
        if (this.bgCanvas) {
            ctx.drawImage(this.bgCanvas, ix, iy);
        } else {
            for (let r = 0; r < this.rows; r++) {
                for (let c = 0; c < this.cols; c++) {
                    const px = c * TILE_SIZE + ix;
                    const py = r * TILE_SIZE + iy;
                    if (this.grid[r][c] === 'W') {
                        this.drawWallTile(ctx, px, py, c, r);
                    } else {
                        this.drawSandTile(ctx, px, py, c, r);
                    }
                }
            }
        }

        // 2. Draw Astral Teleportation Portals
        this.portals.forEach(portal => {
            const px = portal.x - camera.x;
            const py = portal.y - camera.y;
            if (this.isInView(px - 25, py - 25, 50, camera)) {
                this.drawPortal(ctx, px, py, portal);
            }
        });

        // 3. Draw Spike Traps
        this.spikes.forEach(spike => {
            const px = spike.x - camera.x;
            const py = spike.y - camera.y;
            if (this.isInView(px, py, TILE_SIZE, camera)) {
                this.drawSpikeTrap(ctx, px, py, spike);
            }
        });

        // 4. Draw Exit Door
        if (this.exitDoor) {
            const px = this.exitDoor.x - camera.x;
            const py = this.exitDoor.y - camera.y;
            if (this.isInView(px, py, TILE_SIZE, camera)) {
                this.drawExitDoor(ctx, px, py, this.exitDoor);
            }
        }

        // 5. Draw Treasure Chests
        this.chests.forEach(chest => {
            const px = chest.x - camera.x;
            const py = chest.y - camera.y;
            if (this.isInView(px, py, chest.width, camera)) {
                this.drawChest(ctx, px, py, chest);
            }
        });

        // 6. Draw Coins
        this.coins.forEach(coin => {
            if (!coin.collected) {
                const px = coin.x - camera.x;
                const py = coin.y - camera.y;
                if (this.isInView(px - 15, py - 15, 30, camera)) {
                    this.drawCoin(ctx, px, py, coin);
                }
            }
        });

        // 7. Draw Magic Shield Crystals
        this.shields.forEach(s => {
            if (!s.collected) {
                const px = s.x - camera.x;
                const py = s.y - camera.y;
                if (this.isInView(px - 20, py - 20, 40, camera)) {
                    this.drawShieldOrb(ctx, px, py, s);
                }
            }
        });

        // 8. Draw Chrono Hourglasses
        this.timeArtifacts.forEach(t => {
            if (!t.collected) {
                const px = t.x - camera.x;
                const py = t.y - camera.y;
                if (this.isInView(px - 20, py - 20, 40, camera)) {
                    this.drawChronoHourglass(ctx, px, py, t);
                }
            }
        });

        // 9. Draw Arcane Amulets
        this.magicAmulets.forEach(a => {
            if (!a.collected) {
                const px = a.x - camera.x;
                const py = a.y - camera.y;
                if (this.isInView(px - 20, py - 20, 40, camera)) {
                    this.drawArcaneAmulet(ctx, px, py, a);
                }
            }
        });

        // 10. Draw Key (if not yet collected)
        if (this.key && !this.key.collected) {
            const bob = Math.sin(this.key.floatTimer) * 4;
            const px = this.key.x - camera.x;
            const py = this.key.y + bob - camera.y;
            if (this.isInView(px - 20, py - 20, 40, camera)) {
                this.drawKey(ctx, px, py);
            }
        }

        // 11. Draw Cosmic Gold Magnets
        this.magnets.forEach(m => {
            if (!m.collected) {
                const px = m.x - camera.x;
                const py = m.y - camera.y;
                if (this.isInView(px - 20, py - 20, 40, camera)) {
                    this.drawMagnet(ctx, px, py, m);
                }
            }
        });

        // 12. Draw Ethereal Invisibility Cloaks
        this.invisibilityCloaks.forEach(ic => {
            if (!ic.collected) {
                const px = ic.x - camera.x;
                const py = ic.y - camera.y;
                if (this.isInView(px - 20, py - 20, 40, camera)) {
                    this.drawInvisibilityCloak(ctx, px, py, ic);
                }
            }
        });
    }

    isInView(px, py, size, camera) {
        return (
            px + size >= -10 &&
            px <= camera.viewportWidth + 10 &&
            py + size >= -10 &&
            py <= camera.viewportHeight + 10
        );
    }

    /**
     * Draws warm cartoon sand ground tile with subtle texture dots.
     */
    drawSandTile(ctx, x, y, c, r) {
        ctx.fillStyle = COLORS.sand;
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

        // Subtle decorative pebbles/dune speckles
        const hash = ((c * 37) ^ (r * 101)) % 100;
        if (hash < 35) {
            ctx.fillStyle = COLORS.sandDark;
            const ox = (hash * 7) % (TILE_SIZE - 6) + 3;
            const oy = (hash * 13) % (TILE_SIZE - 6) + 3;
            ctx.fillRect(x + ox, y + oy, 3, 2);
        } else if (hash > 80) {
            // Little green grass sprout on the island
            ctx.fillStyle = COLORS.grass;
            ctx.fillRect(x + 18, y + 26, 4, 3);
            ctx.fillRect(x + 20, y + 23, 2, 3);
        }
    }

    /**
     * Draws 2.5D styled cartoon wall/rock barrier with beveling.
     */
    drawWallTile(ctx, x, y, c, r) {
        // Deep soil/stone base
        ctx.fillStyle = COLORS.soilDark;
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

        // Top face block
        ctx.fillStyle = COLORS.soil;
        ctx.fillRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 6);

        // Light top highlight
        ctx.fillStyle = COLORS.soilLight;
        ctx.fillRect(x + 3, y + 2, TILE_SIZE - 6, 4);

        // Brick/stone groove detail
        ctx.fillStyle = COLORS.soilDark;
        ctx.fillRect(x + 4, y + 16, TILE_SIZE - 8, 2);
        const hash = ((c * 17) ^ (r * 43)) % 2;
        if (hash === 0) {
            ctx.fillRect(x + 18, y + 4, 2, 12);
        } else {
            ctx.fillRect(x + 12, y + 18, 2, 14);
        }
    }

    /**
     * Draws sharp metal spike hazard with warning telegraphs.
     */
    drawSpikeTrap(ctx, x, y, spike) {
        // Trap base plate (grate)
        ctx.fillStyle = '#4A4E69';
        ctx.fillRect(x + 4, y + 4, TILE_SIZE - 8, TILE_SIZE - 8);

        ctx.fillStyle = '#22223B';
        ctx.fillRect(x + 8, y + 8, TILE_SIZE - 16, TILE_SIZE - 16);

        if (spike.state === 'down') {
            // Hole holes visible
            ctx.fillStyle = '#111';
            ctx.beginPath();
            ctx.arc(x + 13, y + 13, 2.5, 0, Math.PI * 2);
            ctx.arc(x + 27, y + 13, 2.5, 0, Math.PI * 2);
            ctx.arc(x + 20, y + 27, 2.5, 0, Math.PI * 2);
            ctx.fill();
        } else if (spike.state === 'warning') {
            // Gleaming tips poking out (warning the player!)
            ctx.fillStyle = COLORS.dangerRed;
            ctx.beginPath();
            ctx.arc(x + 13, y + 13, 3, 0, Math.PI * 2);
            ctx.arc(x + 27, y + 13, 3, 0, Math.PI * 2);
            ctx.arc(x + 20, y + 27, 3, 0, Math.PI * 2);
            ctx.fill();
        } else if (spike.state === 'up') {
            // Lethal extended spikes drawn as sharp metallic triangles
            const spikePositions = [
                { bx: x + 8, by: y + 22, tx: x + 14, ty: y + 6, rx: x + 20, ry: y + 22 },
                { bx: x + 20, by: y + 22, tx: x + 26, ty: y + 6, rx: x + 32, ry: y + 22 },
                { bx: x + 14, by: y + 34, tx: x + 20, ty: y + 18, rx: x + 26, ry: y + 34 }
            ];

            spikePositions.forEach(sp => {
                // Shadow
                ctx.fillStyle = 'rgba(0,0,0,0.3)';
                ctx.beginPath();
                ctx.moveTo(sp.bx + 2, sp.by + 2);
                ctx.lineTo(sp.tx + 4, sp.ty + 2);
                ctx.lineTo(sp.rx + 2, sp.ry + 2);
                ctx.fill();

                // Blade body (metallic silver)
                ctx.fillStyle = '#E0E1DD';
                ctx.beginPath();
                ctx.moveTo(sp.bx, sp.by);
                ctx.lineTo(sp.tx, sp.ty);
                ctx.lineTo(sp.rx, sp.ry);
                ctx.closePath();
                ctx.fill();

                // Blade highlight edge
                ctx.strokeStyle = '#FFFFFF';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(sp.bx + 1, sp.by);
                ctx.lineTo(sp.tx, sp.ty);
                ctx.stroke();

                // Blood/Danger tip
                ctx.fillStyle = COLORS.dangerRed;
                ctx.beginPath();
                ctx.moveTo(sp.tx - 2, sp.ty + 4);
                ctx.lineTo(sp.tx, sp.ty);
                ctx.lineTo(sp.tx + 2, sp.ty + 4);
                ctx.fill();
            });
        }
    }

    /**
     * Draws the Exit Door (locked iron door vs open magical portal).
     */
    drawExitDoor(ctx, x, y, door) {
        if (!door.unlocked) {
            // Locked wooden reinforced door
            ctx.fillStyle = '#4A2810';
            ctx.fillRect(x + 3, y + 2, TILE_SIZE - 6, TILE_SIZE - 4);

            // Iron bands
            ctx.fillStyle = '#3D405B';
            ctx.fillRect(x + 3, y + 8, TILE_SIZE - 6, 4);
            ctx.fillRect(x + 3, y + 24, TILE_SIZE - 6, 4);

            // Big padlock icon
            ctx.font = '16px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('🔒', x + TILE_SIZE / 2, y + TILE_SIZE / 2);
        } else {
            // Unlocked glowing exit gate
            ctx.fillStyle = '#1D3557';
            ctx.fillRect(x + 3, y + 2, TILE_SIZE - 6, TILE_SIZE - 4);

            // Pulsing portal light inside
            const pulse = 0.6 + 0.4 * Math.sin(this.animTime * 5);
            ctx.fillStyle = `rgba(72, 202, 228, ${pulse})`;
            ctx.fillRect(x + 6, y + 5, TILE_SIZE - 12, TILE_SIZE - 10);

            // Open door emoji / glowing stars
            ctx.font = '18px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('🚪', x + TILE_SIZE / 2, y + TILE_SIZE / 2);

            // Sparkle halo
            ctx.strokeStyle = COLORS.gold;
            ctx.lineWidth = 2;
            ctx.strokeRect(x + 2, y + 1, TILE_SIZE - 4, TILE_SIZE - 2);
        }
    }

    /**
     * Draws animated 3D spinning gold coin.
     */
    drawCoin(ctx, cx, cy, coin) {
        const radius = coin.radius;
        const scaleX = Math.cos(coin.spinAngle); // -1 to 1 for 3D flip effect

        ctx.save();
        ctx.translate(cx, cy);

        // Ground shadow
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.beginPath();
        ctx.ellipse(0, 8, radius * 0.9, radius * 0.35, 0, 0, Math.PI * 2);
        ctx.fill();

        // Outer rim
        ctx.fillStyle = COLORS.goldDark;
        ctx.beginPath();
        ctx.ellipse(0, 0, Math.max(1.5, Math.abs(scaleX) * radius), radius, 0, 0, Math.PI * 2);
        ctx.fill();

        // Inner face
        ctx.fillStyle = COLORS.gold;
        ctx.beginPath();
        ctx.ellipse(0, 0, Math.max(1, Math.abs(scaleX) * (radius - 2.5)), radius - 2.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Shiny gleam
        if (scaleX > 0.3) {
            ctx.fillStyle = COLORS.goldLight;
            ctx.beginPath();
            ctx.ellipse(-scaleX * 2, -2, Math.max(0.8, scaleX * 2), 3, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }

    /**
     * Draws treasure chest with lid opening animation & treasure glow.
     */
    drawChest(ctx, x, y, chest) {
        const w = chest.width;
        const h = chest.height;

        ctx.save();
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.fillRect(x + 2, y + h - 2, w - 4, 4);

        if (!chest.opened) {
            // Closed Wooden Chest
            // Base
            ctx.fillStyle = '#6F4E37';
            ctx.fillRect(x + 2, y + 10, w - 4, h - 10);

            // Metal reinforcement brackets
            ctx.fillStyle = COLORS.goldDark;
            ctx.fillRect(x + 2, y + 10, 5, h - 10);
            ctx.fillRect(x + w - 7, y + 10, 5, h - 10);

            // Lid
            ctx.fillStyle = '#8B5E3C';
            ctx.beginPath();
            ctx.roundRect(x, y + 2, w, 11, [4, 4, 0, 0]);
            ctx.fill();

            // Gold lock latch
            ctx.fillStyle = COLORS.gold;
            ctx.fillRect(x + w / 2 - 4, y + 8, 8, 7);
            ctx.fillStyle = '#222';
            ctx.fillRect(x + w / 2 - 1, y + 11, 2, 3);
        } else {
            // Opened Chest
            // Chest interior (dark brown)
            ctx.fillStyle = '#4A2E18';
            ctx.fillRect(x + 2, y + 12, w - 4, h - 12);

            // Glowing gold & gems inside
            ctx.fillStyle = COLORS.gold;
            ctx.beginPath();
            ctx.arc(x + 10, y + 16, 5, 0, Math.PI * 2);
            ctx.arc(x + 18, y + 14, 6, 0, Math.PI * 2);
            ctx.arc(x + 24, y + 16, 5, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#48CAE4'; // Ruby/Gem gleam
            ctx.beginPath();
            ctx.arc(x + 16, y + 16, 3, 0, Math.PI * 2);
            ctx.fill();

            // Open lid tilted back (openProgress from 0 to 1)
            const lidOffset = chest.openProgress * 8;
            ctx.fillStyle = '#8B5E3C';
            ctx.beginPath();
            ctx.roundRect(x + 1, y + 2 - lidOffset, w - 2, 9, [3, 3, 1, 1]);
            ctx.fill();

            ctx.fillStyle = COLORS.gold;
            ctx.fillRect(x + w / 2 - 3, y + 6 - lidOffset, 6, 3);

            // Subtle sparkle emitted
            const sparkle = Math.sin(chest.glowTimer);
            if (sparkle > 0.4) {
                ctx.fillStyle = '#FFF';
                ctx.fillRect(x + 14, y + 4, 3, 3);
            }
        }
        ctx.restore();
    }

    /**
     * Draws golden antique skeleton key with gentle bob & sparkle.
     */
    drawKey(ctx, x, y) {
        ctx.save();
        ctx.translate(x, y);

        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.beginPath();
        ctx.ellipse(0, 12, 10, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Key loop (head)
        ctx.fillStyle = COLORS.gold;
        ctx.beginPath();
        ctx.arc(0, -6, 7, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = COLORS.sand;
        ctx.beginPath();
        ctx.arc(0, -6, 3.5, 0, Math.PI * 2);
        ctx.fill();

        // Key stem
        ctx.fillStyle = COLORS.gold;
        ctx.fillRect(-2, 0, 4, 12);

        // Key teeth
        ctx.fillRect(1, 4, 5, 2.5);
        ctx.fillRect(1, 8, 4, 2.5);

        // Bright gleam
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.arc(-2, -8, 1.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    /**
     * Draws fantastic Astral Teleportation Portal with spiral vortex & cosmic runes.
     * Optimized for 60 FPS on low-end machines.
     */
    drawPortal(ctx, x, y, portal) {
        ctx.save();
        ctx.translate(x, y);

        // Ground shadow
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.beginPath();
        ctx.ellipse(0, 14, 16, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Lightweight outer cosmic halo (no heavy shadowBlur)
        ctx.fillStyle = 'rgba(0, 245, 212, 0.2)';
        ctx.beginPath();
        ctx.arc(0, 0, 22, 0, Math.PI * 2);
        ctx.fill();

        // Dark abyss center
        ctx.fillStyle = '#0B091A';
        ctx.beginPath();
        ctx.arc(0, 0, 16, 0, Math.PI * 2);
        ctx.fill();

        // Spiral Neon Ring 1 (Cyan)
        ctx.strokeStyle = COLORS.portalCyan;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.ellipse(0, 0, 15, 9, this.portalAnimAngle, 0, Math.PI * 2);
        ctx.stroke();

        // Spiral Neon Ring 2 (Purple)
        ctx.strokeStyle = COLORS.portalPurple;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(0, 0, 15, 9, -this.portalAnimAngle, 0, Math.PI * 2);
        ctx.stroke();

        // Glowing center warp star
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.arc(0, 0, 3 + Math.sin(this.portalAnimAngle * 2) * 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Portal ID rune marker (1 or 2)
        ctx.font = 'bold 9px "Press Start 2P", monospace';
        ctx.fillStyle = COLORS.portalCyan;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(portal.id, 0, -17);

        ctx.restore();
    }

    /**
     * Draws floating Magic Shield Crystal (Mystic Arcane Orb).
     * Optimized for 60 FPS.
     */
    drawShieldOrb(ctx, x, y, orb) {
        const bob = Math.sin(orb.floatTimer) * 4;
        ctx.save();
        ctx.translate(x, y + bob);

        // Ground shadow
        ctx.fillStyle = 'rgba(0,0,0,0.18)';
        ctx.beginPath();
        ctx.ellipse(0, 14 - bob, 10, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Lightweight cyan halo
        ctx.fillStyle = 'rgba(0, 245, 212, 0.25)';
        ctx.beginPath();
        ctx.arc(0, 0, 16, 0, Math.PI * 2);
        ctx.fill();

        // Diamond gem body
        ctx.fillStyle = COLORS.portalCyan;
        ctx.beginPath();
        ctx.moveTo(0, -12);
        ctx.lineTo(9, 0);
        ctx.lineTo(0, 12);
        ctx.lineTo(-9, 0);
        ctx.closePath();
        ctx.fill();

        // Inner glowing core
        ctx.fillStyle = '#E0FBFC';
        ctx.beginPath();
        ctx.moveTo(0, -7);
        ctx.lineTo(5, 0);
        ctx.lineTo(0, 7);
        ctx.lineTo(-5, 0);
        ctx.closePath();
        ctx.fill();

        // Sparkle glint
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.arc(-2, -3, 1.8, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    /**
     * Draws Chrono Hourglass (Supernatural Time-Slow Artifact).
     * Optimized for 60 FPS.
     */
    drawChronoHourglass(ctx, x, y, item) {
        const bob = Math.sin(item.floatTimer) * 4;
        ctx.save();
        ctx.translate(x, y + bob);

        // Ground shadow
        ctx.fillStyle = 'rgba(0,0,0,0.18)';
        ctx.beginPath();
        ctx.ellipse(0, 14 - bob, 10, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Lightweight golden halo
        ctx.fillStyle = 'rgba(255, 209, 102, 0.22)';
        ctx.beginPath();
        ctx.arc(0, 0, 16, 0, Math.PI * 2);
        ctx.fill();

        // Wooden/Golden Plates (top & bottom)
        ctx.fillStyle = COLORS.gold;
        ctx.fillRect(-8, -12, 16, 3);
        ctx.fillRect(-8, 9, 16, 3);

        // Glass Bulbs (top & bottom triangles)
        ctx.fillStyle = 'rgba(72, 202, 228, 0.5)';
        ctx.beginPath();
        ctx.moveTo(-7, -9);
        ctx.lineTo(7, -9);
        ctx.lineTo(0, 0);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(-7, 9);
        ctx.lineTo(7, 9);
        ctx.lineTo(0, 0);
        ctx.closePath();
        ctx.fill();

        // Magic violet sands flowing
        ctx.fillStyle = '#9D4EDD';
        ctx.beginPath();
        ctx.moveTo(-4, -8);
        ctx.lineTo(4, -8);
        ctx.lineTo(0, -2);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(-5, 8);
        ctx.lineTo(5, 8);
        ctx.lineTo(0, 3);
        ctx.closePath();
        ctx.fill();

        // Sand trickle
        ctx.strokeStyle = '#9D4EDD';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(0, -2);
        ctx.lineTo(0, 3);
        ctx.stroke();

        ctx.restore();
    }

    /**
     * Draws Arcane Pirate Amulet (+2 Magic Fireball Ammo).
     * Optimized for 60 FPS.
     */
    drawArcaneAmulet(ctx, x, y, item) {
        const bob = Math.sin(item.floatTimer) * 4;
        ctx.save();
        ctx.translate(x, y + bob);

        // Ground shadow
        ctx.fillStyle = 'rgba(0,0,0,0.18)';
        ctx.beginPath();
        ctx.ellipse(0, 14 - bob, 10, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Lightweight fiery halo
        ctx.fillStyle = 'rgba(255, 0, 127, 0.22)';
        ctx.beginPath();
        ctx.arc(0, 0, 16, 0, Math.PI * 2);
        ctx.fill();

        // Circular Medallion base
        ctx.fillStyle = COLORS.gold;
        ctx.beginPath();
        ctx.arc(0, 0, 11, 0, Math.PI * 2);
        ctx.fill();

        // Inner ruby/magic core
        ctx.fillStyle = '#7209B7';
        ctx.beginPath();
        ctx.arc(0, 0, 8, 0, Math.PI * 2);
        ctx.fill();

        // Golden Lightning / Flame emblem
        ctx.fillStyle = '#FFE17D';
        ctx.beginPath();
        ctx.moveTo(1, -7);
        ctx.lineTo(-4, 0);
        ctx.lineTo(0, 0);
        ctx.lineTo(-2, 7);
        ctx.lineTo(4, -1);
        ctx.lineTo(0, -1);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    }

    /**
     * Draws Cosmic Gold Magnet (+15 pts & Attracts all coins for 8s).
     * 60 FPS optimized without shadowBlur.
     */
    drawMagnet(ctx, x, y, item) {
        const bob = Math.sin(item.floatTimer) * 4;
        ctx.save();
        ctx.translate(x, y + bob);

        // Ground shadow
        ctx.fillStyle = 'rgba(0,0,0,0.18)';
        ctx.beginPath();
        ctx.ellipse(0, 14 - bob, 10, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Magnetic energy halo
        ctx.fillStyle = 'rgba(255, 201, 60, 0.22)';
        ctx.beginPath();
        ctx.arc(0, 0, 16, 0, Math.PI * 2);
        ctx.fill();

        // Horseshoe magnet body (Red / Blue poles)
        ctx.lineWidth = 5;
        ctx.lineCap = 'round';

        // U-arc curve
        ctx.strokeStyle = '#E63946';
        ctx.beginPath();
        ctx.arc(0, 2, 8, Math.PI * 0.9, Math.PI * 2.1);
        ctx.stroke();

        // Silver/Cyan pole tips
        ctx.fillStyle = '#00F5D4';
        ctx.fillRect(-10, -5, 4, 4);
        ctx.fillRect(6, -5, 4, 4);

        // Central attraction spark
        ctx.fillStyle = '#FFC93C';
        ctx.beginPath();
        ctx.arc(0, -1, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    /**
     * Draws Ethereal Invisibility Cloak (+20 pts & 6s undetected/intangible).
     * 60 FPS optimized without shadowBlur.
     */
    drawInvisibilityCloak(ctx, x, y, item) {
        const bob = Math.sin(item.floatTimer) * 4;
        ctx.save();
        ctx.translate(x, y + bob);

        // Ground shadow
        ctx.fillStyle = 'rgba(0,0,0,0.18)';
        ctx.beginPath();
        ctx.ellipse(0, 14 - bob, 10, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Ethereal purple phantom halo
        ctx.fillStyle = 'rgba(157, 78, 221, 0.25)';
        ctx.beginPath();
        ctx.arc(0, 0, 16, 0, Math.PI * 2);
        ctx.fill();

        // Shimmering hood/cloak shape
        ctx.fillStyle = '#7B2CBF';
        ctx.beginPath();
        ctx.moveTo(0, -11);
        ctx.quadraticCurveTo(11, -8, 8, 8);
        ctx.lineTo(-8, 8);
        ctx.quadraticCurveTo(-11, -8, 0, -11);
        ctx.closePath();
        ctx.fill();

        // Inner glowing ethereal phantom eye/gem
        ctx.fillStyle = '#00F5D4';
        ctx.beginPath();
        ctx.arc(0, -1, 3.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(0, -1, 1.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}

