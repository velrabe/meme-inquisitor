// Константы игры
export const CONFIG = {
    // Флаги
    FLAGS: {
        FIXED_DIFFICULTY: true, // Включить фиксированную сложность (без ускорения)
    },
    
    // Размеры арены (9:16 портретный режим)
    ARENA_WIDTH: 540,
    ARENA_HEIGHT: 960,
    
    // Игрок
    PLAYER_SPEED: 400, // пикселей в секунду
    PLAYER_SIZE: 100, // размер спрайта (увеличен в 2 раза)
    PLAYER_RADIUS: 50, // радиус хитбокса (увеличен в 2 раза)
    PLAYER_FIRE_DELAY: 150, // миллисекунд между выстрелами
    
    // Пули
    BULLET_SPEED: 600, // пикселей в секунду
    BULLET_RADIUS: 5,
    BULLET_COLOR: '#FFD700',
    BULLET_POOL_SIZE: 50,
    
    // Враги
    ENEMY_SPEED: 65, // начальная скорость (медленнее)
    ENEMY_SIZE: 100, // увеличен в 2 раза
    ENEMY_RADIUS: 50, // увеличен в 2 раза
    ENEMY_POOL_SIZE: 50,
    ENEMY_HP: 1,
    
    // Боссы
    BOSS_SPEED: 30, // очень медленно
    BOSS_SIZE: 200, // в 2 раза больше обычного врага
    BOSS_RADIUS: 100, // в 2 раза больше обычного врага
    BOSS_COLOR: '#FF0000', // красный цвет для босса
    BOSS_GLOW: '#FF0000', // свечение босса
    BOSS_LASER_DAMAGE_MULT: 0.2, // боссы получают только 20% урона от лазера
    
    // Конфигурация боссов по уровням
    BOSS_CONFIGS: {
        1: { count: 1, hp: 50 },
        2: { count: 2, hp: 75 },
        3: { count: 1, hp: 150 },
        4: { count: 2, hp: 150 },
        5: { count: 3, hp: 150 },
        6: { count: 1, hp: 500 },
        7: { count: 2, hp: 500 },
        8: { count: 3, hp: 500 },
        // Далее по паттерну для уровней 9+
    },
    
    // Тиры боссов для автоматической генерации уровней 9+
    BOSS_TIERS: [
        { minLevel: 1, maxLevel: 2, baseHP: 50 },   // Тир 1: уровни 1-2
        { minLevel: 3, maxLevel: 5, baseHP: 150 },  // Тир 2: уровни 3-5
        { minLevel: 6, maxLevel: 8, baseHP: 500 },  // Тир 3: уровни 6-8
        { minLevel: 9, maxLevel: 11, baseHP: 1000 }, // Тир 4: уровни 9-11
        { minLevel: 12, maxLevel: 999, baseHP: 2000 }, // Тир 5: уровни 12+
    ],
    
    // Быстрые враги
    FAST_ENEMY_SPEED_MULTIPLIER: 1.5, // в 1.5 раза быстрее
    FAST_ENEMY_MIN_WAVE: 10, // не появляются первые 10-15 волн
    FAST_ENEMY_WAVE_INTERVAL: 4, // появляются раз в 3-5 волн (среднее 4)
    FAST_ENEMY_COUNT_PER_WAVE: 2, // 2-3 врага за волну (среднее 2.5)
    
    // Анимация врагов
    ENEMY_ANIMATION_SPEED: 200, // мс между кадрами
    ENEMY_ANIMATION_FRAMES: 2, // количество кадров анимации
    
    // Спавн врагов
    SPAWN_DELAY: 650, // чаще спавним
    SPAWN_MIN_DELAY: 250, // но есть нижний предел
    SPAWN_ACCELERATION: 0.985, // чуть медленнее ускоряемся
    SPAWN_COLUMNS: 7, // больше колонок для плотной сетки
    SPAWN_MIN_COLUMN_GAP: 14, // минимальный зазор между соседями при спавне (px)
    SPAWN_MIN_TIME_GAP: 60, // минимальный интервал между двумя спавнами в ту же колонку (мс)
    SPAWN_WAVE_ROWS: 2, // сколько рядов за волну
    SPAWN_ROW_VERTICAL_GAP: 48, // минимальный вертикальный зазор между рядами (px)
    SPAWN_ROW_JITTER_X: 6, // небольшой случайный сдвиг по X, чтобы не было идеальных колонок
    
    // Safe Zone
    SAFE_ZONE_HEIGHT: 80, // высота зоны в пикселях
    SAFE_ZONE_COLOR: 'rgba(255, 0, 0, 0.2)',
    
    // Очки
    POINTS_PER_KILL: 1,
    
    // Монеты
    COINS_PER_KILL: 1, // монет за убийство врага
    
    // Визуальные эффекты
    ENEMY_GLOW: '#ff4444',
    PLAYER_GLOW: '#4CAF50',
    
    // Бонусы (pickups)
    PICKUP_SPAWN_INTERVAL: 8, // секунд между спавнами бонусов
    PICKUP_RADIUS: 20,
    PICKUP_SPEED: 80,
    PICKUP_POOL_SIZE: 20,
    
    // Система уровней (новая прогрессия)
    LEVEL_WAVES: [5, 10, 20, 30, 50, 70, 90, 120], // волны для каждого уровня
    // Уровень 1: 5 волн, Уровень 2: 10 волн, Уровень 3: 20 волн, Уровень 4: 30 волн и т.д.
    
    // Враги с повышенным HP (усложнения начинаются с 4-го уровня)
    LEVEL_4_HP_ENEMY_CHANCE: 0.3, // 30% шанс врага с 2 HP на уровне 4+
    LEVEL_6_HP_ENEMY_CHANCE: 0.1, // 10% шанс врага с 5 HP на уровне 6+
    
    // Параметры фиксированной сложности по уровням (для FLAGS.FIXED_DIFFICULTY)
    LEVEL_PARAMS: {
        1: { enemySpeed: 65, spawnDelay: 800 },
        2: { enemySpeed: 70, spawnDelay: 750 },
        3: { enemySpeed: 75, spawnDelay: 700 },
        4: { enemySpeed: 85, spawnDelay: 650 },
        // Для уровней выше 4 используем параметры 4-го уровня
    },
};

