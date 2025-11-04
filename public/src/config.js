// Константы игры
export const CONFIG = {
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
    
    // Визуальные эффекты
    ENEMY_GLOW: '#ff4444',
    PLAYER_GLOW: '#4CAF50',
    
    // Бонусы (pickups)
    PICKUP_SPAWN_INTERVAL: 8, // секунд между спавнами бонусов
    PICKUP_RADIUS: 20,
    PICKUP_SPEED: 80,
    PICKUP_POOL_SIZE: 20,
    
    // Система уровней
    LEVEL_BASE_WAVES: 30, // уровень 1: 30 волн
    LEVEL_WAVE_INCREMENT: 20, // каждый следующий уровень +20 волн
    // Уровень 1: 30 волн, Уровень 2: 50 волн, Уровень 3: 70 волн и т.д.
    
    // Враги с повышенным HP
    LEVEL_2_HP_ENEMY_CHANCE: 0.3, // 30% шанс врага с 2 HP на уровне 2+
    LEVEL_5_HP_ENEMY_CHANCE: 0.1, // 10% шанс врага с 5 HP на уровне 5+
};

