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
        this.lastSpawnByColumn = new Map(); // column -> timestamp
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
                this.enemySpeed += 0.1; // увеличиваем медленнее
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
        // Плотные волны врагов
        const baseCount = 5; // больше базово
        const waveBonus = Math.floor(this.waveCount / 5); // растем быстрее
        const randomBonus = Math.random() < 0.5 ? 1 : 0; // чуть чаще +1
        
        return Math.min(baseCount + waveBonus + randomBonus, 10); // выше потолок
    }
    
    spawnWave() {
        const { w } = getSize();
        const columns = CONFIG.SPAWN_COLUMNS;
        const columnWidth = w / columns;
        const minGap = CONFIG.SPAWN_MIN_COLUMN_GAP;
        const rows = CONFIG.SPAWN_WAVE_ROWS;
        const vGap = CONFIG.SPAWN_ROW_VERTICAL_GAP;
        const jitterX = CONFIG.SPAWN_ROW_JITTER_X;

        // Формируем ряды с шахматным смещением
        for (let row = 0; row < rows; row++) {
            const usedXs = [];
            const offsetHalf = (row % 2 === 0) ? 0 : columnWidth / 2; // шахматное смещение
            const enemiesInWave = this.getEnemiesToSpawn();
            let placed = 0;
            let attempts = 0;
            while (placed < enemiesInWave && attempts < enemiesInWave * 10) {
                attempts++;
                const column = Math.floor(Math.random() * columns);
                let x = column * columnWidth + columnWidth / 2 + offsetHalf;
                // зажимаем в пределы поля
                if (x < CONFIG.ENEMY_RADIUS) x = CONFIG.ENEMY_RADIUS;
                if (x > w - CONFIG.ENEMY_RADIUS) x = w - CONFIG.ENEMY_RADIUS;
                // минимальная дистанция по X в пределах ряда
                const tooClose = usedXs.some(px => Math.abs(px - x) < minGap);
                if (tooClose) continue;
                usedXs.push(x);
                // легкий джиттер по X, чтобы не было идеальных колонок
                x += (Math.random() * 2 - 1) * jitterX;
                const y = -CONFIG.ENEMY_RADIUS - (row * vGap);
                this.enemyPool.spawn(x, y, this.enemySpeed, this.depthCounter);
                placed++;
            }
            // увеличиваем глубину, чтобы верхние ряды уходили под нижние по мере продвижения
            this.depthCounter--;
        }
    }
    
    spawnEnemy() {
        const { w } = getSize();
        const columns = CONFIG.SPAWN_COLUMNS;
        const columnWidth = w / columns;
        const now = performance.now();
        
        // Случайная колонка для спавна
        let column = Math.floor(Math.random() * columns);
        // Не спавним слишком часто в ту же колонку
        const minTimeGap = CONFIG.SPAWN_MIN_TIME_GAP;
        let guard = 0;
        while (guard < 10) {
            const last = this.lastSpawnByColumn.get(column) || -Infinity;
            if (now - last >= minTimeGap) break;
            column = Math.floor(Math.random() * columns);
            guard++;
        }
        this.lastSpawnByColumn.set(column, now);
        const x = column * columnWidth + columnWidth / 2;
        const y = -CONFIG.ENEMY_RADIUS; // Спавн за верхней границей
        
        this.enemyPool.spawn(x, y, this.enemySpeed, this.depthCounter);
    }
}

