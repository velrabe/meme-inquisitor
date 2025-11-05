// Система рангов

// Формула XP для следующего ранга
export function getXPForRank(rank) {
    return 1000 + rank * 500;
}

// Получить текущий ранг по общему XP
export function getRankFromXP(totalXP) {
    let rank = 1;
    let xpRequired = getXPForRank(rank);
    let accumulatedXP = 0;
    
    while (accumulatedXP + xpRequired <= totalXP) {
        accumulatedXP += xpRequired;
        rank++;
        xpRequired = getXPForRank(rank);
    }
    
    return {
        rank,
        currentXP: totalXP - accumulatedXP,
        xpToNext: xpRequired
    };
}

// Титулы по рангам
export const RANK_TITLES = {
    1: 'Novice',
    3: 'Hunter',
    5: 'Inquisitor',
    10: 'Meme Lord'
};

export function getRankTitle(rank) {
    // Находим ближайший титул <= rank
    const availableTitles = Object.keys(RANK_TITLES)
        .map(Number)
        .filter(r => r <= rank)
        .sort((a, b) => b - a);
    
    if (availableTitles.length > 0) {
        return RANK_TITLES[availableTitles[0]];
    }
    
    return RANK_TITLES[1]; // По умолчанию Novice
}

// Цвета звезд по тирам (каждые 5 рангов)
export const STAR_COLORS = [
    '#FFD700', // 1-5: Желтый
    '#FF4444', // 6-10: Красный
    '#4444FF', // 11-15: Синий
    '#AA44FF', // 16-20: Фиолетовый
    '#FF8800', // 21+: Оранжевый
];

export function getStarColor(rank) {
    const tier = Math.floor((rank - 1) / 5);
    return STAR_COLORS[Math.min(tier, STAR_COLORS.length - 1)];
}

// Получить количество звезд и их цвета для отображения
export function getStarsForRank(rank) {
    const tier = Math.floor((rank - 1) / 5);
    const starsInTier = ((rank - 1) % 5) + 1; // 1-5 звезд в текущем тире
    
    const currentColor = getStarColor(rank);
    const nextColor = tier + 1 < STAR_COLORS.length ? STAR_COLORS[tier + 1] : currentColor;
    
    const stars = [];
    
    // Добавляем активные звезды текущего цвета
    for (let i = 0; i < starsInTier; i++) {
        stars.push({ active: true, color: currentColor });
    }
    
    // Добавляем неактивные звезды следующего цвета
    for (let i = starsInTier; i < 5; i++) {
        stars.push({ active: false, color: nextColor });
    }
    
    return stars;
}

