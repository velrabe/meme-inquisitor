// Система спавна врагов
import { CONFIG } from './config.js';
import { getSize } from './renderer.js';

export class Spawner {
    constructor(enemyPool, world) {
        this.enemyPool = enemyPool;
        this.world = world;
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
        this.fastEnemyWaveCounter = 0; // счетчик для быстрых врагов
    }
    
    // Вычисляем требуемое количество волн для текущего уровня
    getWavesForLevel(level) {
        return CONFIG.LEVEL_BASE_WAVES + (level - 1) * CONFIG.LEVEL_WAVE_INCREMENT;
    }
    
    // Проверяем и обновляем уровень
    updateLevel() {
        const requiredWaves = this.getWavesForLevel(this.world.level);
        if (this.world.currentLevelWaves >= requiredWaves) {
            this.world.level++;
            this.world.currentLevelWaves = 0;
            console.log(`Level Up! Now at level ${this.world.level}`);
        }
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
            
            // Увеличиваем счетчики волн
            this.world.currentLevelWaves++;
            this.world.totalWaves++;
            this.fastEnemyWaveCounter++;
            
            // Проверяем и обновляем уровень
            this.updateLevel();
        }
    }
    
    getEnemiesToSpawn() {
        // Плотные волны врагов
        const baseCount = 5; // больше базово
        const waveBonus = Math.floor(this.waveCount / 5); // растем быстрее
        const randomBonus = Math.random() < 0.5 ? 1 : 0; // чуть чаще +1
        
        return Math.min(baseCount + waveBonus + randomBonus, 10); // выше потолок
    }
    
    // Определяем HP врага в зависимости от уровня
    getEnemyHP() {
        const level = this.world.level;
        
        // Уровень 5+: 10% шанс врага с 5 HP
        if (level >= 5 && Math.random() < CONFIG.LEVEL_5_HP_ENEMY_CHANCE) {
            return 5;
        }
        
        // Уровень 2+: 30% шанс врага с 2 HP
        if (level >= 2 && Math.random() < CONFIG.LEVEL_2_HP_ENEMY_CHANCE) {
            return 2;
        }
        
        return 1; // обычный враг
    }
    
    // Проверяем, нужно ли спавнить быстрых врагов в этой волне
    shouldSpawnFastEnemies() {
        // Не появляются первые 10-15 волн
        if (this.world.totalWaves < CONFIG.FAST_ENEMY_MIN_WAVE) {
            return false;
        }
        
        // Появляются раз в 3-5 волн (используем интервал из конфига)
        return this.fastEnemyWaveCounter >= CONFIG.FAST_ENEMY_WAVE_INTERVAL;
    }
    
    // Получаем количество быстрых врагов для волны
    getFastEnemyCount() {
        // 2-3 врага (случайно)
        return Math.floor(CONFIG.FAST_ENEMY_COUNT_PER_WAVE + Math.random() * 1.5);
    }
    
    spawnWave() {
        const { w } = getSize();
        const columns = CONFIG.SPAWN_COLUMNS;
        const columnWidth = w / columns;
        const minGap = CONFIG.SPAWN_MIN_COLUMN_GAP;
        const rows = CONFIG.SPAWN_WAVE_ROWS;
        const vGap = CONFIG.SPAWN_ROW_VERTICAL_GAP;
        const jitterX = CONFIG.SPAWN_ROW_JITTER_X;

        // Проверяем нужно ли спавнить быстрых врагов
        const spawnFast = this.shouldSpawnFastEnemies();
        const fastCount = spawnFast ? this.getFastEnemyCount() : 0;
        let fastSpawned = 0;
        
        // Если спавним быстрых врагов - сбрасываем счетчик
        if (spawnFast) {
            this.fastEnemyWaveCounter = 0;
        }

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
                
                // Определяем параметры врага
                const isFast = fastSpawned < fastCount;
                const hp = this.getEnemyHP();
                const speed = isFast ? this.enemySpeed * CONFIG.FAST_ENEMY_SPEED_MULTIPLIER : this.enemySpeed;
                
                this.enemyPool.spawn(x, y, speed, this.depthCounter, hp, isFast);
                
                if (isFast) fastSpawned++;
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
        
        // Определяем HP врага
        const hp = this.getEnemyHP();
        
        this.enemyPool.spawn(x, y, this.enemySpeed, this.depthCounter, hp, false);
    }
}

