# GamePush Fields Documentation

Документация по полям, сохраняемым в GamePush для игры Meme Inquisitor.

## 📊 Player Fields

### Основные поля прогресса

| Поле | Тип | Описание |
|------|-----|----------|
| `score` | Number | Общий XP игрока (используется для вычисления ранга) |
| `rank` | Number | Текущий ранг игрока (1, 2, 3, ...) |
| `level` | Number | Текущий уровень игрока |
| `coins` | Number | Монеты игрока (валюта для покупок) |

### Статистика

| Поле | Тип | Описание |
|------|-----|----------|
| `kills` | Number | Всего убийств врагов |
| `deaths` | Number | Всего смертей |
| `best_score` | Number | Лучший счет за сессию (legacy, может быть убран) |

### Система прокачки

| Поле | Тип | Описание | Пример |
|------|-----|----------|--------|
| `upgrades` | String (JSON) | **Постоянные перки** из магазина | `{"fireRate":3,"speed":2,"damage":1}` |
| `consumables` | String (JSON) | **Расходники** (будет добавлено позже) | `{"shield":2,"bomb":5}` |

## 🎮 Структура данных

### upgrades (Постоянные перки)

JSON объект, где:
- **Ключ** - ID улучшения (`fireRate`, `speed`, `damage`, `bulletSpeed`)
- **Значение** - Уровень улучшения (1, 2, 3, ...)

```json
{
  "fireRate": 3,
  "speed": 2,
  "damage": 1,
  "bulletSpeed": 2
}
```

**Особенности:**
- Сохраняются навсегда между сессиями
- Применяются автоматически при загрузке игры
- Мерж при синхронизации: берется максимальный уровень

### consumables (Расходники) - FUTURE

JSON объект для временных предметов:
- **Ключ** - ID расходника
- **Значение** - Количество

```json
{
  "shield": 2,
  "bomb": 5,
  "speedBoost": 1
}
```

**Особенности:**
- Расходуются во время игры
- Пополняются через покупку в магазине
- Могут иметь ограничение на максимальное количество

## 🔄 Синхронизация

### При загрузке игры:
1. Загружаем из `localStorage`
2. Загружаем из GamePush
3. Мерж: берем максимальные значения
4. Сохраняем обновленную версию в оба источника

### При покупке:
1. Обновляем локальное состояние
2. Сохраняем в `localStorage`
3. Синхронизируем с GamePush

### При сбросе:
- Все поля устанавливаются в начальные значения
- `upgrades` = `{}`
- Синхронизация с GamePush

## 📝 Примеры использования

### Загрузка перков
```javascript
const cloudUpgrades = window.gp.player.get('upgrades');
const purchases = JSON.parse(cloudUpgrades);
```

### Сохранение перков
```javascript
const upgradesString = JSON.stringify(purchases);
window.gp.player.set('upgrades', upgradesString);
await window.gp.player.sync();
```

### Сброс всех данных
```javascript
window.gp.player.set('upgrades', '{}');
window.gp.player.set('consumables', '{}');
window.gp.player.set('score', 0);
// ... остальные поля
await window.gp.player.sync();
```

## 🎯 Система рангов

Ранг вычисляется из `score` по формуле:
```javascript
xpForNextRank = 1000 + rank * 500
```

Титулы:
- Rank 1: Novice
- Rank 3: Hunter
- Rank 5: Inquisitor
- Rank 10: Meme Lord

## 💡 Best Practices

1. **Всегда используй JSON.stringify/parse** для сложных объектов
2. **Проверяй на null** перед парсингом
3. **Мерж данных** при конфликте (берем лучшее из двух)
4. **Async/await** для всех операций с GamePush
5. **Обрабатывай ошибки** - GamePush может быть недоступен

## 🔮 Будущие расширения

### Планируется добавить:
- `consumables` - расходники
- `achievements` - достижения
- `settings` - настройки игрока
- `dailyRewards` - ежедневные награды



