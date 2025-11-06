// Профиль игрока с покупками

export class Profile {
    constructor() {
        this.purchases = {}; // { upgradeId: level }
    }
    
    // Загрузка покупок из localStorage и GamePush
    async load() {
        // Сначала загружаем из localStorage
        const saved = localStorage.getItem('shopPurchases');
        if (saved) {
            try {
                this.purchases = JSON.parse(saved);
            } catch (err) {
                console.error('Failed to load purchases from localStorage:', err);
                this.purchases = {};
            }
        }
        
        // Загружаем из GamePush если доступен
        if (window.gp && window.gp.player) {
            try {
                await window.gp.player.ready;
                
                const cloudUpgrades = window.gp.player.get('upgrades');
                if (cloudUpgrades) {
                    try {
                        const cloudPurchases = JSON.parse(cloudUpgrades);
                        let hasChanges = false;
                        
                        // Мержим: берем максимальный уровень для каждого апгрейда
                        for (const upgradeId in cloudPurchases) {
                            const cloudLevel = cloudPurchases[upgradeId] || 0;
                            const localLevel = this.purchases[upgradeId] || 0;
                            if (cloudLevel > localLevel) {
                                this.purchases[upgradeId] = cloudLevel;
                                hasChanges = true;
                            }
                        }
                        
                        // Также добавляем локальные апгрейды которых нет в облаке
                        for (const upgradeId in this.purchases) {
                            if (!cloudPurchases[upgradeId] && this.purchases[upgradeId] > 0) {
                                hasChanges = true;
                            }
                        }
                        
                        // Сохраняем только если были изменения
                        if (hasChanges) {
                            this.save();
                            await this.syncToGamePush();
                        }
                    } catch (err) {
                        console.error('Failed to parse upgrades from GamePush:', err);
                    }
                } else if (Object.keys(this.purchases).length > 0) {
                    // Если в cloud пусто, но локально есть - синхронизируем
                    await this.syncToGamePush();
                }
            } catch (err) {
                console.error('Failed to load upgrades from GamePush:', err);
            }
        }
    }
    
    // Сохранение покупок в localStorage
    save() {
        localStorage.setItem('shopPurchases', JSON.stringify(this.purchases));
    }
    
    // Синхронизация с GamePush
    async syncToGamePush() {
        if (window.gp && window.gp.player) {
            try {
                await window.gp.player.ready;
                
                const upgradesString = JSON.stringify(this.purchases);
                window.gp.player.set('upgrades', upgradesString);
                
                await window.gp.player.sync();
                console.log('Upgrades synced to GamePush:', this.purchases);
            } catch (err) {
                console.error('Failed to sync upgrades to GamePush:', err);
            }
        }
    }
    
    // Покупка улучшения
    async buyUpgrade(upgradeId, cost, world) {
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
        
        // Сохраняем локально и в GamePush
        this.save();
        await this.syncToGamePush();
        
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
    async reset() {
        this.purchases = {};
        this.save();
        await this.syncToGamePush();
    }
}

