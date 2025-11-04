// Контейнер всех игровых объектов
export const world = {
    player: null,
    bullets: [],
    enemies: [],
    score: 0,
    bestScore: 0,
    level: 1, // текущий уровень
    currentLevelWaves: 0, // волны, пройденные на текущем уровне
    totalWaves: 0, // всего волн с начала игры
    
    reset() {
        this.score = 0;
        this.currentLevelWaves = 0;
        this.totalWaves = 0;
        // level и bestScore не сбрасываем - сохраняем прогресс
    }
};

