// Главный файл игры
import { CONFIG } from './config.js';
import { initRenderer, clear, drawBackground, drawOverlay, drawPlayer, drawChain, drawEnemy, drawBullet, drawSafeZone, drawPickup, drawActiveUpgrades, getSize, getContext } from './renderer.js';
import { initInput, getInput, resetInput } from './input.js';
import { getState, setState, isPlaying, isPaused, isLose, GameState } from './state.js';
import { world } from './world.js';
import { Player } from './player.js';
import { BulletPool } from './bulletPool.js';
import { EnemyPool } from './enemyPool.js';
import { Spawner } from './spawner.js';
import { CollisionSystem } from './collisions.js';
import { UI } from './ui.js';
import { initStorage, loadBestScore, saveLocalBestScore, saveBestScore, loadLevel, saveLocalLevel, saveLevel, loadCoins, saveLocalCoins, saveCoins, loadPlayerStats, saveLocalPlayerStats, savePlayerStats, syncWithGamePush, resetGamePush } from './storage.js';
import { UpgradeManager } from './upgrades/upgradeManager.js';
import { PickupPool } from './upgrades/pickupPool.js';
import { Profile } from './profile.js';
import { SHOP_ITEMS } from './shop.js';
import { getRankFromXP, getRankTitle, getStarsForRank } from './rank.js';

// Игровые системы
let player;
let bulletPool;
let enemyPool;
let spawner;
let collisionSystem;
let ui;
let upgradeManager;
let pickupPool;
let profile; // Профиль игрока с покупками
let pickupSpawnTimer = 0;
let recordBeatenThisSession = false; // Флаг: был ли побит рекорд в этой сессии
let levelUpThisSession = false; // Флаг: был ли повышен уровень в этой сессии
let gameOverHandled = false; // Флаг: был ли уже обработан game over
let previousLevel = 1; // Предыдущий уровень для отслеживания изменений

let lastTime = 0;

async function init() {
    console.log('Initializing game...');
    
    // Инициализация систем
    initRenderer();
    initInput();
    
    // UI
    ui = new UI();
    ui.onRestart(restart);
    
    // Кнопка паузы
    const pauseBtn = document.getElementById('pauseBtn');
    const pauseModal = document.getElementById('pauseModal');
    const resumeBtn = document.getElementById('resumeBtn');
    const restartFromPauseBtn = document.getElementById('restartFromPauseBtn');
    
    pauseBtn.addEventListener('click', () => {
        if (isPlaying()) {
            setState(GameState.PAUSED);
            pauseModal.classList.remove('hidden');
        }
    });
    
    resumeBtn.addEventListener('click', () => {
        setState(GameState.PLAYING);
        pauseModal.classList.add('hidden');
    });
    
    restartFromPauseBtn.addEventListener('click', () => {
        setState(GameState.PLAYING);
        pauseModal.classList.add('hidden');
        // Сбрасываем уровень до 1 при "Начать сначала"
        world.level = 1;
        saveLocalLevel(1); // Сохраняем локально
        restart();
    });
    
    // Модальное окно повышения уровня
    const levelUpModal = document.getElementById('levelUpModal');
    const levelUpText = document.getElementById('levelUpText');
    const continueBtn = document.getElementById('continueBtn');
    
    window.addEventListener('levelUp', (event) => {
        const previousLevel = event.detail.level - 1;
        levelUpText.textContent = `Уровень ${previousLevel} пройден!`;
        setState(GameState.PAUSED);
        levelUpModal.classList.remove('hidden');
    });
    
    continueBtn.addEventListener('click', () => {
        setState(GameState.PLAYING);
        levelUpModal.classList.add('hidden');
    });
    
    // Магазин
    const shopBtn = document.getElementById('shopBtn');
    const shopModal = document.getElementById('shopModal');
    const closeShopBtn = document.getElementById('closeShopBtn');
    const shopItemsContainer = document.getElementById('shopItems');
    const shopCoinsValue = document.getElementById('shopCoinsValue');
    const purchasedUpgradesContainer = document.getElementById('purchasedUpgrades');
    
    function updateShopUI() {
        // Проверяем, что профиль инициализирован
        if (!profile) {
            console.warn('Profile not initialized yet');
            return;
        }
        
        // Обновляем количество монет в магазине
        if (shopCoinsValue) {
            shopCoinsValue.textContent = world.coins;
        }
        
        // Очищаем и перестраиваем список предметов
        if (shopItemsContainer) {
            shopItemsContainer.innerHTML = '';
            
            SHOP_ITEMS.forEach(item => {
                const currentLevel = profile.getUpgradeLevel(item.id);
                const maxed = currentLevel >= item.maxLevel;
                
                const itemDiv = document.createElement('div');
                itemDiv.className = 'shop-item';
                
                itemDiv.innerHTML = `
                    <div class="shop-item-info">
                        <div class="shop-item-name">${item.name}</div>
                        <div class="shop-item-description">${item.description}</div>
                        <div class="shop-item-level">Уровень: ${currentLevel}/${item.maxLevel}</div>
                    </div>
                    <div class="shop-item-actions">
                        <div class="shop-item-cost">💰 ${item.cost}</div>
                        <button class="shop-buy-btn" data-item-id="${item.id}" ${maxed ? 'disabled' : ''}>
                            ${maxed ? 'МАКС' : 'Купить'}
                        </button>
                    </div>
                `;
                
                shopItemsContainer.appendChild(itemDiv);
            });
            
            // Добавляем обработчики на кнопки покупки
            const buyButtons = shopItemsContainer.querySelectorAll('.shop-buy-btn');
            buyButtons.forEach(btn => {
                btn.addEventListener('click', () => {
                    const itemId = btn.getAttribute('data-item-id');
                    const item = SHOP_ITEMS.find(i => i.id === itemId);
                    
                    if (!item) return;
                    
                    // Пытаемся купить
                    const success = profile.buyUpgrade(itemId, item.cost, world);
                    
                    if (success) {
                        // Сохраняем монеты
                        saveLocalCoins(world.coins);
                        
                        // Обновляем UI
                        ui.updateCoins(world.coins);
                        updateShopUI();
                        updatePurchasedUpgradesUI();
                        
                        // Применяем улучшения к игроку
                        profile.applyUpgrades(player, CONFIG, SHOP_ITEMS);
                    }
                });
            });
        }
    }
    
    function updatePurchasedUpgradesUI() {
        if (!purchasedUpgradesContainer || !profile) return;
        
        purchasedUpgradesContainer.innerHTML = '';
        
        // Показываем только купленные улучшения
        SHOP_ITEMS.forEach(item => {
            const level = profile.getUpgradeLevel(item.id);
            
            if (level > 0) {
                const upgradeDiv = document.createElement('div');
                upgradeDiv.className = 'purchased-upgrade-item';
                upgradeDiv.innerHTML = `
                    <span class="upgrade-name">${item.name}</span>
                    <span class="upgrade-level">Lv.${level}</span>
                `;
                purchasedUpgradesContainer.appendChild(upgradeDiv);
            }
        });
    }
    
    shopBtn.addEventListener('click', () => {
        setState(GameState.PAUSED);
        updateShopUI();
        shopModal.classList.remove('hidden');
    });
    
    closeShopBtn.addEventListener('click', () => {
        setState(GameState.PLAYING);
        shopModal.classList.add('hidden');
    });
    
    // Модальное окно статистики
    const rankSection = document.getElementById('rankSection');
    const statsModal = document.getElementById('statsModal');
    const closeStatsBtn = document.getElementById('closeStatsBtn');
    const statsRank = document.getElementById('statsRank');
    const statsTitle = document.getElementById('statsTitle');
    const statsTotalXP = document.getElementById('statsTotalXP');
    const statsKills = document.getElementById('statsKills');
    const statsDeaths = document.getElementById('statsDeaths');
    
    function updateStatsModal() {
        if (statsRank) statsRank.textContent = world.rank;
        if (statsTitle) statsTitle.textContent = getRankTitle(world.rank);
        if (statsTotalXP) statsTotalXP.textContent = (world.score || 0).toLocaleString();
        if (statsKills) statsKills.textContent = (world.kills || 0).toLocaleString();
        if (statsDeaths) statsDeaths.textContent = (world.deaths || 0).toLocaleString();
    }
    
    if (rankSection) {
        rankSection.addEventListener('click', () => {
            updateStatsModal();
            statsModal.classList.remove('hidden');
        });
    }
    
    if (closeStatsBtn) {
        closeStatsBtn.addEventListener('click', () => {
            statsModal.classList.add('hidden');
        });
    }
    
    // Уведомление о повышении ранга
    const rankUpNotification = document.getElementById('rankUpNotification');
    const rankUpTitle = document.getElementById('rankUpTitle');
    
    window.addEventListener('rankUp', (event) => {
        const { rank, title } = event.detail;
        
        if (rankUpTitle) {
            rankUpTitle.textContent = title;
        }
        
        if (rankUpNotification) {
            rankUpNotification.classList.remove('hidden');
            
            // Скрываем через 1 секунду
            setTimeout(() => {
                rankUpNotification.classList.add('hidden');
            }, 1000);
        }
    });
    
    
    // Кнопка сброса GamePush
    const resetGPBtn = document.getElementById('resetGPBtn');
    if (resetGPBtn) {
        resetGPBtn.addEventListener('click', async () => {
            console.log('Resetting GamePush...');
            const result = await resetGamePush();
            if (result) {
                // Сбрасываем все локально
                world.bestScore = 0;
                world.level = 1;
                world.coins = 0;
                world.score = 0;
                world.rank = 1;
                world.kills = 0;
                world.deaths = 0;
                localStorage.removeItem('bestScore');
                localStorage.removeItem('level');
                localStorage.removeItem('coins');
                localStorage.removeItem('score');
                localStorage.removeItem('rank');
                localStorage.removeItem('kills');
                localStorage.removeItem('deaths');
                
                // Перезагружаем страницу для чистого старта
                window.location.reload();
            } else {
                alert('Ошибка при сбросе!');
            }
        });
    }
    
    // Инициализация GamePush и загрузка данных
    await initStorage();
    world.bestScore = await loadBestScore();
    world.level = await loadLevel();
    world.coins = await loadCoins();
    
    // Загружаем статистику игрока (rank, score, kills, deaths)
    const stats = await loadPlayerStats();
    world.score = stats.score;
    world.rank = stats.rank;
    world.kills = stats.kills;
    world.deaths = stats.deaths;
    
    previousLevel = world.level; // Запоминаем начальный уровень
    ui.updateBestScore(world.bestScore);
    ui.updateLevel(world.level);
    ui.updateCoins(world.coins);
    ui.updateRank(world.rank, world.score);
    
    // Создание пулов
    bulletPool = new BulletPool();
    enemyPool = new EnemyPool();
    pickupPool = new PickupPool();
    world.bullets = bulletPool;
    world.enemies = enemyPool;
    world.pickups = pickupPool;
    
    // Создание профиля
    profile = new Profile();
    
    // Инициализируем UI купленных улучшений (после создания профиля!)
    updatePurchasedUpgradesUI();
    
    // Создание менеджера улучшений
    upgradeManager = new UpgradeManager(world);
    world.upgradeManager = upgradeManager;
    
    // Создание игровых объектов
    player = new Player(bulletPool, upgradeManager);
    world.player = player;
    
    // Применяем купленные улучшения к игроку
    profile.applyUpgrades(player, CONFIG, SHOP_ITEMS);
    
    spawner = new Spawner(enemyPool, world);
    collisionSystem = new CollisionSystem(world);
    
    // Старт игры
    setState(GameState.PLAYING);
    
    // Сохранение ЛОКАЛЬНО при закрытии вкладки или перезагрузке
    window.addEventListener('beforeunload', () => {
        // Сохраняем лучший счет (на случай если рекорд побит, но игрок не проиграл)
        if (recordBeatenThisSession) {
            saveLocalBestScore(world.bestScore);
        }
        // Сохраняем текущий уровень и монеты
        saveLocalLevel(world.level);
        saveLocalCoins(world.coins);
    });
    
    // Сохранение ЛОКАЛЬНО при потере фокуса (переключение вкладок)
    window.addEventListener('blur', () => {
        // Сохраняем лучший счет (на случай если рекорд побит, но игрок не проиграл)
        if (recordBeatenThisSession) {
            saveLocalBestScore(world.bestScore);
        }
        // Сохраняем текущий уровень и монеты
        saveLocalLevel(world.level);
        saveLocalCoins(world.coins);
    });
    
    console.log('Game initialized, starting loop...');
    requestAnimationFrame(gameLoop);
}

function gameLoop(time) {
    const dt = lastTime ? Math.min((time - lastTime) / 1000, 0.1) : 0;
    lastTime = time;
    
    if (isPlaying()) {
        update(dt);
    }
    
    // Рендерим всегда (даже в паузе), чтобы игра не "замерзала"
    render();
    
    requestAnimationFrame(gameLoop);
}

function update(dt) {
    // 1. Обработка ввода
    const input = getInput();
    
    // 2. Обновление игрока
    player.update(dt, input);
    
    // 3. Обновление менеджера улучшений
    upgradeManager.update(dt);
    
    // 4. Спавн врагов
    spawner.update(dt);
    
    // 5. Спавн бонусов
    pickupSpawnTimer += dt;
    if (pickupSpawnTimer >= CONFIG.PICKUP_SPAWN_INTERVAL) {
        pickupPool.spawnRandom();
        pickupSpawnTimer = 0;
    }
    
    // 6. Обновление пуль, врагов и бонусов
    bulletPool.update(dt);
    enemyPool.update(dt);
    pickupPool.update(dt);
    
    // 7. Проверка столкновений
    collisionSystem.update();
    
    // 8. Обновление UI
    ui.updateScore(world.sessionScore);
    ui.updateLevel(world.level);
    ui.updateWaves(world.currentLevelWaves, spawner.getWavesForLevel(world.level));
    ui.updateCoins(world.coins);
    
    // 8.1. Обновление ранга
    const previousRank = world.rank;
    const currentTotalScore = world.score + world.sessionScore; // общий score + текущая сессия
    const rankInfo = getRankFromXP(currentTotalScore);
    world.rank = rankInfo.rank;
    
    // Проверяем повышение ранга
    if (world.rank > previousRank) {
        // Уведомление о повышении ранга
        window.dispatchEvent(new CustomEvent('rankUp', { 
            detail: { 
                rank: world.rank,
                title: getRankTitle(world.rank)
            } 
        }));
    }
    
    ui.updateRank(world.rank, currentTotalScore);
    
    // Проверка повышения уровня и сохранение ЛОКАЛЬНО
    if (world.level > previousLevel) {
        previousLevel = world.level;
        // Сохраняем новый уровень ТОЛЬКО локально
        saveLocalLevel(world.level);
        // Устанавливаем флаг что уровень повышен в этой сессии
        levelUpThisSession = true;
    }
    
    // Проверка нового рекорда и сохранение ЛОКАЛЬНО
    if (world.score > world.bestScore) {
        world.bestScore = world.score;
        ui.updateBestScore(world.bestScore);
        // Сохраняем новый рекорд ТОЛЬКО локально
        saveLocalBestScore(world.bestScore);
        // Устанавливаем флаг что рекорд побит в этой сессии
        recordBeatenThisSession = true;
    }
    
    // 9. Проверка проигрыша
    if (isLose() && !gameOverHandled) {
        handleGameOver();
    }
}

function render() {
    clear();
    
    const { w, h } = getSize();
    const ctx = getContext();
    
    // Отрисовка фона (тайловый)
    drawBackground();
    
    // Отрисовка оверлея (поверх фона)
    drawOverlay();
    
    // Отрисовка safe zone
    drawSafeZone(CONFIG.SAFE_ZONE_HEIGHT, CONFIG.SAFE_ZONE_COLOR);
    
    // Отрисовка врагов: строгая сортировка по Y (ниже рисуем позже => выше по Z),
    // затем по depth и id для стабильности
    const enemies = enemyPool.getActive().sort((a, b) => {
        if (a.y !== b.y) return a.y - b.y;
        if (a.depth !== b.depth) return a.depth - b.depth;
        return a.id - b.id;
    });
    for (const enemy of enemies) {
        drawEnemy(enemy);
    }
    
    // Отрисовка бонусов
    const pickups = pickupPool.getActive();
    for (const pickup of pickups) {
        drawPickup(pickup);
    }
    
    // Отрисовка пуль
    const bullets = bulletPool.getActive();
    for (const bullet of bullets) {
        drawBullet(bullet.x, bullet.y, bullet.radius, bullet.color);
    }
    
    // Отрисовка игрока (с эффектом свечения при выстреле)
    drawPlayer(player.x, player.y, player.radius, player.shootFlash);
    
    // Отрисовка цепи (слой выше игрока)
    drawChain(player.x, player.y, player.radius, player.chainAngle);
    
    // Отрисовка weapon override (например, лазер)
    upgradeManager.drawWeaponOverride(ctx);
    
    // Отрисовка визуальных эффектов (взрывы и т.п.)
    upgradeManager.drawEffects(ctx);
    
    // Отрисовка активных улучшений
    drawActiveUpgrades(upgradeManager);
}

function handleGameOver() {
    // Защита от повторных вызовов
    if (gameOverHandled) return;
    gameOverHandled = true;
    
    console.log('Game Over! Score:', world.sessionScore);
    
    // СРАЗУ показываем экран проигрыша (UX-дружелюбно)
    ui.showLoseScreen(world.sessionScore, world.bestScore);
    
    // Сохраняем в GamePush "за кулисами" если рекорд был побит
    if (recordBeatenThisSession) {
        // Асинхронно сохраняем без блокировки UI
        saveBestScore(world.bestScore).then(() => {
            console.log('New record saved to GamePush:', world.bestScore);
        }).catch(err => {
            console.error('Failed to save record to GamePush:', err);
        });
        // Сбрасываем флаг
        recordBeatenThisSession = false;
    }
    
    // Сохраняем уровень в GamePush если он был повышен
    if (levelUpThisSession) {
        // Асинхронно сохраняем без блокировки UI
        saveLevel(world.level).then(() => {
            console.log('Level saved to GamePush:', world.level);
        }).catch(err => {
            console.error('Failed to save level to GamePush:', err);
        });
        // Сбрасываем флаг
        levelUpThisSession = false;
    }
    
    // Всегда сохраняем монеты при окончании игры
    saveCoins(world.coins).then(() => {
        console.log('Coins saved to GamePush:', world.coins);
    }).catch(err => {
        console.error('Failed to save coins to GamePush:', err);
    });
    
    // Добавляем XP за сессию к общему score и увеличиваем deaths
    world.score += world.sessionScore; // Добавляем sessionScore к общему score
    world.deaths++; // Увеличиваем счетчик смертей
    
    // Пересчитываем ранг
    const rankInfo = getRankFromXP(world.score);
    world.rank = rankInfo.rank;
    
    // Сохраняем статистику
    const stats = {
        score: world.score,
        rank: world.rank,
        kills: world.kills,
        deaths: world.deaths
    };
    
    savePlayerStats(stats).then(() => {
        console.log('Player stats saved to GamePush:', stats);
    }).catch(err => {
        console.error('Failed to save player stats to GamePush:', err);
    });
}

function restart() {
    console.log('Restarting game...');
    
    // Сброс состояния
    setState(GameState.PLAYING);
    
    // Сброс UI
    ui.hideLoseScreen();
    
    // Скрываем модальное окно паузы если открыто
    const pauseModal = document.getElementById('pauseModal');
    if (pauseModal) {
        pauseModal.classList.add('hidden');
    }
    
    // Сброс world
    world.reset();
    
    // Сброс игровых объектов
    player.reset();
    bulletPool.reset();
    enemyPool.reset();
    pickupPool.reset();
    spawner.reset();
    upgradeManager.reset();
    
    // Сброс таймера спавна бонусов и флагов
    pickupSpawnTimer = 0;
    recordBeatenThisSession = false;
    levelUpThisSession = false;
    gameOverHandled = false;
    previousLevel = world.level; // Запоминаем текущий уровень
    
    // Сброс ввода
    resetInput();
    
    // Обновление UI
    ui.updateScore(world.sessionScore);
    ui.updateLevel(world.level);
    ui.updateWaves(0, spawner.getWavesForLevel(world.level));
    
    // Сброс времени
    lastTime = 0;
}

// Запуск игры после загрузки страницы
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

