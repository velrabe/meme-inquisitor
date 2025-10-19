// Система спавна врагов
import { CONFIG } from './config.js';
import { getSize } from './renderer.js';

export class Spawner {
    constructor(enemyPool) {
        this.enemyPool = enemyPool;
        this.reset();
    }
    
    reset() {
        this.timer = 0;
        this.delay = CONFIG.SPAWN_DELAY;
        this.enemySpeed = CONFIG.ENEMY_SPEED;
        this.waveCount = 0;
        this.waveTimer = 0; // таймер для волнового спавна
        this.waveDelay = 2000; // задержка между волнами
        this.depthCounter = 1000; // начальная глубина (большое число)
    }
    
    update(dt) {
        this.timer -= dt * 1000; // dt в секундах, timer в мс
        this.waveTimer -= dt * 1000;
        
        // Обычный спавн отдельных врагов
        if (this.timer <= 0) {
            this.spawnEnemy();
            this.timer = this.delay;
            
            // Постепенно ускоряем волну
            this.waveCount++;
            if (this.waveCount % 0.2 === 0) { // ускоряем еще чаще
                this.delay = Math.max(
                    CONFIG.SPAWN_MIN_DELAY,
                    this.delay * CONFIG.SPAWN_ACCELERATION
                );
                this.enemySpeed += 0.2; // более медленное увеличение скорости
            }
        }
        
        // Волновой спавн для создания плотных формаций
        if (this.waveTimer <= 0) {
            this.spawnWave();
            this.waveTimer = this.waveDelay;
            this.depthCounter--; // уменьшаем глубину для новой волны (чтобы была под старой)
        }
    }
    
    getEnemiesToSpawn() {
        // Создаем плотные волны врагов (увеличено в 1.5 раза)
        const baseCount = 3; // минимум 3 врага (увеличено с 2)
        const waveBonus = Math.floor(this.waveCount / 6); // +1 враг каждые 6 волн (чаще)
        const randomBonus = Math.random() < 0.4 ? 1 : 0; // случайный бонус (больше)
        
        return Math.min(baseCount + waveBonus + randomBonus, 6); // максимум 6 врагов за раз
    }
    
    spawnWave() {
        const { w } = getSize();
        const columns = CONFIG.SPAWN_COLUMNS;
        const columnWidth = w / columns;
        
        // Создаем плотную волну врагов
        const enemiesInWave = this.getEnemiesToSpawn();
        
        for (let i = 0; i < enemiesInWave; i++) {
            // Спавним врагов в разных колонках
            const column = Math.floor(Math.random() * columns);
            const x = column * columnWidth + columnWidth / 2;
            const y = -CONFIG.ENEMY_RADIUS - (i * 10); // небольшое смещение по Y для создания рядов
            
            this.enemyPool.spawn(x, y, this.enemySpeed, this.depthCounter);
        }
    }
    
    spawnEnemy() {
        const { w } = getSize();
        const columns = CONFIG.SPAWN_COLUMNS;
        const columnWidth = w / columns;
        
        // Случайная колонка для спавна
        const column = Math.floor(Math.random() * columns);
        const x = column * columnWidth + columnWidth / 2;
        const y = -CONFIG.ENEMY_RADIUS; // Спавн за верхней границей
        
        this.enemyPool.spawn(x, y, this.enemySpeed, this.depthCounter);
    }
}

