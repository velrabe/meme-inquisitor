// Профиль игрока с покупками

export class Profile {
    constructor() {
        this.purchases = {}; // { upgradeId: level }
        this.load();
    }
    
    // Загрузка покупок из localStorage
    load() {
        const saved = localStorage.getItem('shopPurchases');
        if (saved) {
            try {
                this.purchases = JSON.parse(saved);
            } catch (err) {
                console.error('Failed to load purchases:', err);
                this.purchases = {};
            }
        }
    }
    
    // Сохранение покупок в localStorage
    save() {
        localStorage.setItem('shopPurchases', JSON.stringify(this.purchases));
    }
    
    // Покупка улучшения
    buyUpgrade(upgradeId, cost, world) {
        // Проверяем хватает ли монет
        if (world.coins < cost) {
            return false;
        }
        
        // Снимаем монеты
        world.coins -= cost;
        
        // Увеличиваем уровень улучшения
        if (!this.purchases[upgradeId]) {
            this.purchases[upgradeId] = 0;
        }
        this.purchases[upgradeId]++;
        
        // Сохраняем
        this.save();
        
        return true;
    }
    
    // Получить уровень улучшения
    getUpgradeLevel(upgradeId) {
        return this.purchases[upgradeId] || 0;
    }
    
    // Применить все купленные улучшения к игроку
    applyUpgrades(player, config, shopItems) {
        let fireDelayMult = 1;
        let speedMult = 1;
        let damagePlus = 0;
        let bulletSpeedMult = 1;
        
        // Проходим по всем купленным улучшениям
        for (const upgradeId in this.purchases) {
            const level = this.purchases[upgradeId];
            const item = shopItems.find(i => i.id === upgradeId);
            
            if (!item || level === 0) continue;
            
            // Применяем эффект для каждого уровня
            for (let i = 0; i < level; i++) {
                if (item.effect.fireDelayMult) {
                    fireDelayMult *= item.effect.fireDelayMult;
                }
                if (item.effect.speedMult) {
                    speedMult *= item.effect.speedMult;
                }
                if (item.effect.damagePlus) {
                    damagePlus += item.effect.damagePlus;
                }
                if (item.effect.bulletSpeedMult) {
                    bulletSpeedMult *= item.effect.bulletSpeedMult;
                }
            }
        }
        
        // Применяем к игроку
        player.fireDelay = config.PLAYER_FIRE_DELAY * fireDelayMult;
        player.speed = config.PLAYER_SPEED * speedMult;
        player.damage = 1 + damagePlus; // базовый урон 1
        player.bulletSpeed = config.BULLET_SPEED * bulletSpeedMult;
    }
    
    // Сброс всех покупок
    reset() {
        this.purchases = {};
        this.save();
    }
}

