/**
 * Xazina Ovchisi - Revive Quiz System (Matematika, Ingliz tili, Geografiya)
 * Gives defeated players an educational second chance to revive with +1 heart!
 */

export const QUIZ_CATEGORIES = {
    MATH: {
        id: 'math',
        name: 'Matematika',
        icon: '🔢',
        badgeClass: 'category-math'
    },
    ENGLISH: {
        id: 'english',
        name: 'Ingliz tili',
        icon: '🇬🇧',
        badgeClass: 'category-english'
    },
    GEOGRAPHY: {
        id: 'geography',
        name: 'Geografiya',
        icon: '🌍',
        badgeClass: 'category-geography'
    }
};

export const QUIZ_QUESTIONS = {
    math: [
        { q: "7 + 8 = ?", correct: "15", options: ["14", "15", "16", "17"] },
        { q: "10 - 4 = ?", correct: "6", options: ["5", "6", "7", "4"] },
        { q: "3 × 4 = ?", correct: "12", options: ["10", "11", "12", "14"] },
        { q: "9 + 9 = ?", correct: "18", options: ["17", "18", "19", "20"] },
        { q: "20 - 7 = ?", correct: "13", options: ["12", "13", "14", "15"] },
        { q: "5 × 5 = ?", correct: "25", options: ["20", "24", "25", "30"] },
        { q: "16 ÷ 4 = ?", correct: "4", options: ["3", "4", "5", "8"] },
        { q: "15 + 15 = ?", correct: "30", options: ["25", "28", "30", "35"] },
        { q: "6 × 3 = ?", correct: "18", options: ["16", "18", "21", "24"] },
        { q: "50 - 20 = ?", correct: "30", options: ["20", "25", "30", "35"] },
        { q: "4 × 6 = ?", correct: "24", options: ["20", "22", "24", "28"] },
        { q: "18 ÷ 2 = ?", correct: "9", options: ["7", "8", "9", "10"] },
        { q: "12 + 8 = ?", correct: "20", options: ["19", "20", "21", "22"] },
        { q: "2 × 9 = ?", correct: "18", options: ["16", "17", "18", "20"] },
        { q: "100 - 40 = ?", correct: "60", options: ["50", "60", "70", "40"] },
        { q: "8 × 5 = ?", correct: "40", options: ["35", "40", "45", "50"] },
        { q: "25 + 25 = ?", correct: "50", options: ["40", "45", "50", "55"] },
        { q: "14 - 8 = ?", correct: "6", options: ["5", "6", "7", "8"] },
        { q: "7 × 2 = ?", correct: "14", options: ["12", "13", "14", "16"] },
        { q: "30 ÷ 5 = ?", correct: "6", options: ["4", "5", "6", "7"] }
    ],
    english: [
        { q: "'Olma' so'zining inglizchasi nima?", correct: "Apple", options: ["Apple", "Banana", "Orange", "Grape"] },
        { q: "'Kitob' so'zining inglizchasi nima?", correct: "Book", options: ["Pen", "Book", "Bag", "Desk"] },
        { q: "'Quyosh' so'zining inglizchasi nima?", correct: "Sun", options: ["Moon", "Star", "Sun", "Sky"] },
        { q: "'Suv' so'zining inglizchasi nima?", correct: "Water", options: ["Milk", "Tea", "Juice", "Water"] },
        { q: "'Mushuk' so'zining inglizchasi nima?", correct: "Cat", options: ["Dog", "Cat", "Bird", "Fish"] },
        { q: "'It' (kuchuk) so'zining inglizchasi nima?", correct: "Dog", options: ["Cat", "Dog", "Fox", "Bear"] },
        { q: "'Maktab' so'zining inglizchasi nima?", correct: "School", options: ["House", "Park", "School", "Shop"] },
        { q: "'Do'st' so'zining inglizchasi nima?", correct: "Friend", options: ["Brother", "Friend", "Family", "Teacher"] },
        { q: "'Qizil' rangining inglizchasi nima?", correct: "Red", options: ["Blue", "Green", "Yellow", "Red"] },
        { q: "'Yashil' rangining inglizchasi nima?", correct: "Green", options: ["Green", "Black", "White", "Pink"] },
        { q: "'Moviy' (ko'k) rangining inglizchasi nima?", correct: "Blue", options: ["Red", "Blue", "Brown", "Orange"] },
        { q: "'Rahmat' ingliz tilida qanday bo'ladi?", correct: "Thank you", options: ["Hello", "Goodbye", "Thank you", "Please"] },
        { q: "'Salom' ingliz tilida qanday bo'ladi?", correct: "Hello", options: ["Hello", "Bye", "Good night", "Sorry"] },
        { q: "'Katta' so'zining inglizchasi nima?", correct: "Big", options: ["Small", "Big", "Fast", "Little"] },
        { q: "'Kichik' so'zining inglizchasi nima?", correct: "Small", options: ["Big", "Small", "Tall", "Long"] },
        { q: "'Qalam' so'zining inglizchasi nima?", correct: "Pencil", options: ["Pencil", "Eraser", "Ruler", "Book"] },
        { q: "'Oila' so'zining inglizchasi nima?", correct: "Family", options: ["Friend", "Family", "People", "Child"] },
        { q: "'Xayr' so'zining inglizchasi nima?", correct: "Goodbye", options: ["Welcome", "Sorry", "Goodbye", "Good morning"] },
        { q: "'Besh' soni inglizcha qanday bo'ladi?", correct: "Five", options: ["Four", "Five", "Six", "Seven"] },
        { q: "'Dengiz' so'zining inglizchasi nima?", correct: "Sea", options: ["Sea", "River", "Lake", "Mountain"] }
    ],
    geography: [
        { q: "O'zbekistonning poytaxti qaysi shahar?", correct: "Toshkent", options: ["Samarqand", "Buxoro", "Toshkent", "Xiva"] },
        { q: "Dunyoning eng katta okeani qaysi?", correct: "Tinch okeani", options: ["Atlantika okeani", "Tinch okeani", "Hind okeani", "Shimoliy Muz okeani"] },
        { q: "Samarqanddagi mashhur tarixiy maydon qaysi?", correct: "Registon", options: ["Registon", "Qizil maydon", "Eyfel maydoni", "Toj Mahal"] },
        { q: "Fransiyaning poytaxti qaysi shahar?", correct: "Parij", options: ["London", "Rim", "Berlin", "Parij"] },
        { q: "Yer sayyorasida nechta qit'a bor?", correct: "6 ta", options: ["4 ta", "5 ta", "6 ta", "8 ta"] },
        { q: "O'zbekistonda nechta viloyat bor (Qoraqalpog'iston Respublikasidan tashqari)?", correct: "12 ta", options: ["10 ta", "12 ta", "14 ta", "16 ta"] },
        { q: "Dunyoning eng baland tog' cho'qqisi qaysi?", correct: "Everest", options: ["Elbrus", "Everest", "Monblan", "Kilimanjaro"] },
        { q: "Qadimiy Buxoro shahrining mashhur minorasi qaysi?", correct: "Kalon minorasi", options: ["Kalon minorasi", "Eyfel minorasi", "Piza minorasi", "Qutb minorasi"] },
        { q: "Amudaryo va Sirdaryo qaysi dengizga quyilgan?", correct: "Orol dengizi", options: ["Kaspiy dengizi", "Qora dengiz", "Orol dengizi", "Baykal"] },
        { q: "Italiyaning poytaxti qaysi shahar?", correct: "Rim", options: ["Milan", "Venetsiya", "Rim", "Florensiya"] },
        { q: "Quyosh sistemasida Quyoshga eng yaqin sayyora qaysi?", correct: "Merkuriy", options: ["Venera", "Merkuriy", "Mars", "Yer"] },
        { q: "Misr davlatidagi eng mashhur qadimiy obidalar nima?", correct: "Piramidalar", options: ["Piramidalar", "Kolizey", "Buyuk Xitoy devori", "Big Ben"] },
        { q: "O'zbekiston qaysi qit'ada joylashgan?", correct: "Osiyo", options: ["Yevropa", "Osiyo", "Afrika", "Amerika"] },
        { q: "Yaponiyaning poytaxti qaysi shahar?", correct: "Tokio", options: ["Kioto", "Seul", "Pekin", "Tokio"] },
        { q: "Yer yuzidagi eng sovuq qit'a qaysi?", correct: "Antarktida", options: ["Afrika", "Avstraliya", "Antarktida", "Janubiy Amerika"] },
        { q: "Ichan Qal'a qaysi qadimiy shaharda joylashgan?", correct: "Xiva", options: ["Qarshi", "Termiz", "Xiva", "Qo'qon"] },
        { q: "Rossiyaning poytaxti qaysi shahar?", correct: "Moskva", options: ["Sankt-Peterburg", "Moskva", "Qozon", "Sochi"] },
        { q: "Buyuk Britaniyaning poytaxti qaysi shahar?", correct: "London", options: ["London", "Parij", "Liverpul", "Dublin"] }
    ]
};

export class QuizManager {
    constructor() {
        this.categoryKeys = ['math', 'english', 'geography'];
        this.lastCategoryIndex = 0;
        this.recentQuestionIndices = {
            math: [],
            english: [],
            geography: []
        };
    }

    /**
     * Generates a fresh dynamic math question for endless variety.
     */
    generateDynamicMathQuestion() {
        const types = ['add', 'sub', 'mul'];
        const type = types[Math.floor(Math.random() * types.length)];
        let a, b, ans, op;

        if (type === 'add') {
            a = Math.floor(Math.random() * 18) + 4;
            b = Math.floor(Math.random() * 18) + 3;
            ans = a + b;
            op = '+';
        } else if (type === 'sub') {
            b = Math.floor(Math.random() * 12) + 3;
            ans = Math.floor(Math.random() * 15) + 2;
            a = ans + b;
            op = '-';
        } else {
            a = Math.floor(Math.random() * 8) + 2;
            b = Math.floor(Math.random() * 7) + 2;
            ans = a * b;
            op = '×';
        }

        // Generate 3 plausible distractors
        const set = new Set([ans]);
        const offsets = [-2, -1, 1, 2, 3, -3, 10, -10];
        while (set.size < 4) {
            const off = offsets[Math.floor(Math.random() * offsets.length)];
            const val = ans + off;
            if (val > 0 && val !== ans) {
                set.add(val);
            }
        }

        const options = Array.from(set).map(String);
        // Shuffle options
        for (let i = options.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [options[i], options[j]] = [options[j], options[i]];
        }

        return {
            q: `${a} ${op} ${b} = ?`,
            correct: String(ans),
            options
        };
    }

    /**
     * Retrieves a random question from math, english or geography.
     */
    getRandomQuestion() {
        // Rotate categories fairly: math -> english -> geography
        const catKey = this.categoryKeys[this.lastCategoryIndex % this.categoryKeys.length];
        this.lastCategoryIndex++;

        const categoryInfo = QUIZ_CATEGORIES[catKey.toUpperCase()];

        // 35% chance of dynamic math for infinite freshness
        if (catKey === 'math' && Math.random() < 0.35) {
            const dynamicQ = this.generateDynamicMathQuestion();
            return {
                category: categoryInfo,
                ...dynamicQ
            };
        }

        const bank = QUIZ_QUESTIONS[catKey];
        const recent = this.recentQuestionIndices[catKey];

        // Pick index not recently used
        let idx = Math.floor(Math.random() * bank.length);
        if (recent.includes(idx) && bank.length > 5) {
            idx = Math.floor(Math.random() * bank.length);
        }
        recent.push(idx);
        if (recent.length > 6) recent.shift();

        const item = bank[idx];

        // Shuffle options
        const shuffled = [...item.options];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }

        return {
            category: categoryInfo,
            q: item.q,
            correct: item.correct,
            options: shuffled
        };
    }
}
