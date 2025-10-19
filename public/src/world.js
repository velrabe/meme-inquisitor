// Контейнер всех игровых объектов
export const world = {
    player: null,
    bullets: [],
    enemies: [],
    score: 0,
    bestScore: 0,
    
    reset() {
        this.score = 0;
        // bestScore не сбрасываем
    }
};

