// Контейнер всех игровых объектов
export const world = {
    player: null,
    bullets: [],
    enemies: [],
    score: 0, // Общий XP (сохраняется между сессиями, используется для вычисления ранга)
    sessionScore: 0, // XP только за текущую сессию (для отображения на экране проигрыша)
    rank: 1, // Текущий ранг (вычисляется из score)
    level: 1, // текущий уровень
    currentLevelWaves: 0, // волны, пройденные на текущем уровне
    totalWaves: 0, // всего волн с начала игры
    coins: 0, // монеты игрока (сохраняются между сессиями)
    kills: 0, // Всего убийств (сохраняется между сессиями)
    deaths: 0, // Всего смертей (сохраняется между сессиями)
    
    reset() {
        this.sessionScore = 0;
        this.currentLevelWaves = 0;
        this.totalWaves = 0;
        // level, score, rank, coins, kills и deaths не сбрасываем - сохраняем прогресс
    }
};

