// Константы игры
export const CONFIG = {
    // Размеры арены
    ARENA_WIDTH: 800,
    ARENA_HEIGHT: 600,
    
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
    ENEMY_SPEED: 100, // начальная скорость
    ENEMY_SIZE: 100, // увеличен в 2 раза
    ENEMY_RADIUS: 50, // увеличен в 2 раза
    ENEMY_POOL_SIZE: 50,
    ENEMY_HP: 1,
    
    // Анимация врагов
    ENEMY_ANIMATION_SPEED: 200, // мс между кадрами
    ENEMY_ANIMATION_FRAMES: 2, // количество кадров анимации
    
    // Спавн врагов
    SPAWN_DELAY: 800, // начальный интервал спавна в мс
    SPAWN_MIN_DELAY: 200, // минимальный интервал
    SPAWN_ACCELERATION: 0.98, // коэффициент ускорения волны
    SPAWN_COLUMNS: 6, // количество колонок для спавна
    
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
};

