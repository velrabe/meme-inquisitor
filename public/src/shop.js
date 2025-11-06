// Магазин улучшений

export const SHOP_ITEMS = [
    {
        id: 'fireRate',
        name: 'Скорострельность +10%',
        description: 'Уменьшает задержку между выстрелами на 10%',
        baseCost: 100, // Базовая цена для первого уровня
        maxLevel: 10,
        effect: { fireDelayMult: 0.9 }
    },
    {
        id: 'speed',
        name: 'Скорость игрока +10%',
        description: 'Увеличивает скорость движения на 10%',
        baseCost: 150,
        maxLevel: 5,
        effect: { speedMult: 1.1 }
    },
    {
        id: 'damage',
        name: 'Урон +1',
        description: 'Увеличивает урон пуль на 1',
        baseCost: 200,
        maxLevel: 5,
        effect: { damagePlus: 1 }
    },
    {
        id: 'bulletSpeed',
        name: 'Скорость пуль +15%',
        description: 'Увеличивает скорость полета пуль на 15%',
        baseCost: 120,
        maxLevel: 5,
        effect: { bulletSpeedMult: 1.15 }
    },
];

// Функция для вычисления цены улучшения на основе текущего уровня
// Каждый уровень стоит в 2 раза дороже предыдущего
export function getUpgradeCost(baseCost, currentLevel) {
    return baseCost * Math.pow(2, currentLevel);
}

