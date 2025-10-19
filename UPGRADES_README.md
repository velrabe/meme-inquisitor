# Система улучшений (Upgrades/Powerups)

## 📋 Обзор

Система улучшений добавляет в игру бонусы (powerups), которые можно активировать, стреляя по ним. Бонусы летят сверху вниз, как враги, и дают временные или мгновенные эффекты.

## 🗂️ Архитектура

```
/src/upgrades/
  ├── upgrades.js        # Реестр всех апгрейдов (описания)
  ├── upgradeManager.js  # Управление активными эффектами/таймерами
  └── pickupPool.js      # Пул объектов-бонусов
```

## 🎮 Как это работает

1. **Спавн бонусов**: Каждые 8 секунд (настраивается в `CONFIG.PICKUP_SPAWN_INTERVAL`) появляется случайный бонус
2. **Активация**: Нужно попасть в бонус определенное количество раз (hitsToActivate)
3. **Эффект**: При активации применяется эффект (временный или мгновенный)
4. **Таймер**: Временные эффекты показываются в левом верхнем углу с оставшимся временем

## 📦 Доступные улучшения

### 1. Speed++ (bulletSpeedX2)
- **Цвет**: Голубой (#00FFFF)
- **Попаданий**: 1
- **Длительность**: 5 сек
- **Эффект**: Удваивает скорость пуль

### 2. Pierce (pierce1)
- **Цвет**: Фиолетовый (#FF00FF)
- **Попаданий**: 1
- **Длительность**: 5 сек
- **Эффект**: Пули пробивают 1 врага (уничтожаются на втором)

### 3. Triple (triple)
- **Цвет**: Желтый (#FFFF00)
- **Попаданий**: 1
- **Длительность**: 5 сек
- **Эффект**: Стреляет тремя пулями (центр, -5°, +5°)

### 4. Boom (bomb)
- **Цвет**: Красный (#FF0000)
- **Попаданий**: 1
- **Тип**: Мгновенный
- **Эффект**: Убивает всех врагов в радиусе 160px с красивым визуальным эффектом

### 5. Laser (laser)
- **Цвет**: Белый (#FFFFFF)
- **Попаданий**: 2
- **Длительность**: 5 сек
- **Эффект**: Заменяет оружие на непрерывный лазер, прожигающий всех врагов на линии

## 🔧 Как добавить новое улучшение

### Шаг 1: Добавить в `upgrades.js`

```javascript
export const UPGRADES = {
  // ... существующие апгрейды ...
  
  myNewUpgrade: {
    id: 'myNewUpgrade',
    label: 'My Power',        // Название (отображается на бонусе)
    type: 'timed',            // 'timed' или 'instant'
    duration: 5,              // Длительность в секундах (только для timed)
    hitsToActivate: 1,        // Сколько раз нужно попасть
    color: '#00FF00',         // Цвет бонуса
    
    // Хуки (опциональны):
    
    // Применить эффект при активации (timed)
    apply(mgr) {
      mgr.multipliers.bulletSpeed *= 2;
    },
    
    // Убрать эффект при истечении времени (timed)
    remove(mgr) {
      mgr.multipliers.bulletSpeed /= 2;
    },
    
    // При создании пули
    onBulletSpawn(bullet) {
      bullet.pierceLeft = 1;
    },
    
    // При попадании пули во врага
    onBulletHit({ bullet, enemy }) {
      if (bullet.pierceLeft > 0) {
        bullet.pierceLeft--;
        bullet._keepAlive = true;
      }
    },
    
    // При выстреле (для создания дополнительных пуль)
    onFire(mgr, fireFn, originX, originY) {
      fireFn(originX, originY, -10 * Math.PI / 180);
    },
    
    // Мгновенный эффект (instant)
    onActivate(mgr, x, y) {
      mgr.killEnemiesInRadius(x, y, 200);
    }
  }
};
```

### Шаг 2: Типы улучшений

#### Временные (timed)
```javascript
{
  type: 'timed',
  duration: 5,
  apply(mgr) { /* активация */ },
  remove(mgr) { /* деактивация */ }
}
```

#### Мгновенные (instant)
```javascript
{
  type: 'instant',
  onActivate(mgr, x, y) { /* мгновенный эффект */ }
}
```

### Шаг 3: Доступные хуки

#### `onBulletSpawn(bullet)`
Вызывается при создании каждой пули. Можно изменять свойства пули:
- `bullet.pierceLeft` - количество пробиваний
- `bullet.vx`, `bullet.vy` - скорость
- `bullet.color` - цвет
- и др.

#### `onBulletHit({ bullet, enemy })`
Вызывается при попадании пули во врага. Установите `bullet._keepAlive = true`, чтобы пуля не исчезла.

#### `onFire(mgr, fireFn, originX, originY)`
Вызывается при выстреле. Используйте `fireFn(x, y, angle)` для создания дополнительных пуль.

#### `onActivate(mgr, x, y)` (только instant)
Вызывается один раз при активации бонуса.

## 🎨 Мультипликаторы

В `upgradeManager` доступны глобальные мультипликаторы:

```javascript
mgr.multipliers = {
  bulletSpeed: 1,  // Множитель скорости пуль
  // Можно добавить свои
};
```

## 🔫 Weapon Override

Для особых режимов оружия (например, лазер):

```javascript
startWeaponOverride(mgr) {
  mgr.weaponOverride = {
    type: 'laser',
    update(dt, world) { /* логика */ },
    draw(ctx, world) { /* отрисовка */ },
    fireBlocked: true  // блокирует обычные пули
  };
},
endWeaponOverride(mgr) {
  mgr.weaponOverride = null;
}
```

## 🛠️ UpgradeManager API

### Методы:
- `activate(upgradeId, x, y)` - активировать улучшение
- `killEnemiesInRadius(x, y, radius)` - убить врагов в радиусе
- `spawnRingFx(x, y, radius)` - создать визуальный эффект кольца
- `isFireBlocked()` - проверить, заблокирован ли огонь
- `reset()` - сбросить все эффекты

### Хуки (для интеграции):
- `onBulletSpawn(bullet)` - вызвать при создании пули
- `onBulletHit(bullet, enemy)` - вызвать при попадании
- `onFire(fireFn, x, y)` - вызвать при выстреле

## ⚙️ Настройки (config.js)

```javascript
// Бонусы (pickups)
PICKUP_SPAWN_INTERVAL: 8,  // секунд между спавнами
PICKUP_RADIUS: 20,          // радиус бонуса
PICKUP_SPEED: 80,           // скорость падения
PICKUP_POOL_SIZE: 20,       // размер пула
```

## 📝 Примеры кастомных улучшений

### Быстрая стрельба
```javascript
rapidFire: {
  id: 'rapidFire',
  label: 'Rapid',
  type: 'timed',
  duration: 5,
  hitsToActivate: 1,
  color: '#FFA500',
  apply(mgr) {
    mgr.world.player.fireDelay /= 2;
  },
  remove(mgr) {
    mgr.world.player.fireDelay *= 2;
  }
}
```

### Двойной пирсинг
```javascript
pierce2: {
  id: 'pierce2',
  label: 'Pierce++',
  type: 'timed',
  duration: 5,
  hitsToActivate: 2,
  color: '#9900FF',
  onBulletSpawn(b) {
    b.pierceLeft = 2;  // Пробивает 2 врагов
  },
  onBulletHit({ bullet }) {
    if (bullet.pierceLeft > 0) {
      bullet.pierceLeft--;
      bullet._keepAlive = true;
    }
  }
}
```

### Телепорт игрока в центр
```javascript
teleport: {
  id: 'teleport',
  label: 'Teleport',
  type: 'instant',
  hitsToActivate: 1,
  color: '#00FFFF',
  onActivate(mgr) {
    const { w } = getSize();
    mgr.world.player.x = w / 2;
  }
}
```

## 🐛 Отладка

Для отладки системы улучшений включите логирование:
```javascript
console.log('Active effects:', upgradeManager.activeEffects);
console.log('Multipliers:', upgradeManager.multipliers);
```

## 📚 Интеграция в игру

Система уже полностью интегрирована:
1. ✅ Бонусы спавнятся автоматически
2. ✅ Столкновения с пулями обрабатываются
3. ✅ Эффекты применяются и отслеживаются
4. ✅ UI показывает активные эффекты
5. ✅ Визуальные эффекты отрисовываются
6. ✅ Сброс при рестарте работает

Просто запустите игру и наслаждайтесь!

