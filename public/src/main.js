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
import { initStorage, loadBestScore, saveLocalBestScore, saveBestScore, loadLevel, saveLocalLevel, saveLevel, syncWithGamePush, resetGamePush } from './storage.js';
import { UpgradeManager } from './upgrades/upgradeManager.js';
import { PickupPool } from './upgrades/pickupPool.js';

// Игровые системы
let player;
let bulletPool;
let enemyPool;
let spawner;
let collisionSystem;
let ui;
let upgradeManager;
let pickupPool;
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
        restart();
    });
    
    
    // Кнопка сброса GamePush
    const resetGPBtn = document.getElementById('resetGPBtn');
    if (resetGPBtn) {
        resetGPBtn.addEventListener('click', async () => {
            console.log('Resetting GamePush...');
            const result = await resetGamePush();
            if (result) {
                alert('Сброс выполнен! Перезагрузите страницу для проверки.');
                // Обновляем UI
                world.bestScore = 0;
                ui.updateBestScore(0);
            } else {
                alert('Ошибка при сбросе!');
            }
        });
    }
    
    // Инициализация GamePush и загрузка лучшего счета и уровня
    await initStorage();
    world.bestScore = await loadBestScore();
    world.level = await loadLevel();
    previousLevel = world.level; // Запоминаем начальный уровень
    ui.updateBestScore(world.bestScore);
    ui.updateLevel(world.level);
    
    // Создание пулов
    bulletPool = new BulletPool();
    enemyPool = new EnemyPool();
    pickupPool = new PickupPool();
    world.bullets = bulletPool;
    world.enemies = enemyPool;
    world.pickups = pickupPool;
    
    // Создание менеджера улучшений
    upgradeManager = new UpgradeManager(world);
    world.upgradeManager = upgradeManager;
    
    // Создание игровых объектов
    player = new Player(bulletPool, upgradeManager);
    world.player = player;
    
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
        // Сохраняем текущий уровень
        saveLocalLevel(world.level);
    });
    
    // Сохранение ЛОКАЛЬНО при потере фокуса (переключение вкладок)
    window.addEventListener('blur', () => {
        // Сохраняем лучший счет (на случай если рекорд побит, но игрок не проиграл)
        if (recordBeatenThisSession) {
            saveLocalBestScore(world.bestScore);
        }
        // Сохраняем текущий уровень
        saveLocalLevel(world.level);
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
    ui.updateScore(world.score);
    ui.updateLevel(world.level);
    ui.updateWaves(world.currentLevelWaves, spawner.getWavesForLevel(world.level));
    
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
    
    console.log('Game Over! Score:', world.score);
    
    // СРАЗУ показываем экран проигрыша (UX-дружелюбно)
    ui.showLoseScreen(world.score, world.bestScore);
    
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
    ui.updateScore(0);
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

