// Интеграция с GamePush
let gpReady = false;

// Проверяем, инициализирован ли GamePush
function checkGP() {
    return !!(window.gp && window.gp.player);
}

// Инициализация после загрузки GP
export function initStorage() {
    return new Promise((resolve) => {
        if (window.gp && window.gp.player) {
            gpReady = true;
            resolve();
        } else {
            let resolved = false; // Флаг для предотвращения двойного resolve
            
            // Проверяем периодически, не стал ли GamePush доступен
            const checkInterval = setInterval(() => {
                if (window.gp && window.gp.player && !resolved) {
                    resolved = true;
                    gpReady = true;
                    clearInterval(checkInterval);
                    clearTimeout(timeoutId);
                    window.removeEventListener('gamepushReady', handleGamePushReady);
                    resolve();
                }
            }, 100); // Проверяем каждые 100мс
            
            // Слушаем событие готовности GamePush
            const handleGamePushReady = () => {
                if (resolved) return; // Предотвращаем двойной resolve
                resolved = true;
                gpReady = true;
                clearInterval(checkInterval);
                window.removeEventListener('gamepushReady', handleGamePushReady);
                clearTimeout(timeoutId);
                resolve();
            };
            
            window.addEventListener('gamepushReady', handleGamePushReady);
            
            // Таймаут на случай если GP не загрузится
            const timeoutId = setTimeout(() => {
                if (resolved) return; // Предотвращаем двойной resolve
                resolved = true;
                clearInterval(checkInterval);
                window.removeEventListener('gamepushReady', handleGamePushReady);
                resolve();
            }, 10000); // Увеличиваем таймаут до 10 секунд
        }
    });
}

// Загрузка уровня (аналогично loadBestScore)
export async function loadLevel() {
    // Сначала загружаем из localStorage (локальное хранение)
    const localLevelStr = localStorage.getItem('level');
    const localLevel = localLevelStr ? parseInt(localLevelStr, 10) : 1;
    
    // Ждем немного, если GamePush еще не готов
    if (!window.gp || !window.gp.player) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Ждем 1 секунду
    }
    
    // Попробуем использовать GamePush если он доступен
    if (window.gp && window.gp.player) {
        try {
            // КРИТИЧЕСКИ ВАЖНО: ждем готовности player
            await window.gp.player.ready;
            
            // Загружаем level из GamePush
            const cloudLevel = window.gp.player.get('level');
            
            if (cloudLevel !== null && cloudLevel !== undefined) {
                const cloudLevelNum = cloudLevel || 1;
                
                // Берем максимальное значение между локальным и облачным
                const maxLevel = Math.max(localLevel, cloudLevelNum);
                
                // ВСЕГДА обновляем локальное хранилище максимальным значением
                localStorage.setItem('level', maxLevel.toString());
                
                // Если локальный уровень больше облачного - помечаем для синхронизации
                // (синхронизация произойдет при следующем сохранении)
                if (localLevel > cloudLevelNum) {
                    // Не синхронизируем сразу, чтобы не создавать лишние запросы при загрузке
                }
                
                return maxLevel;
            }
        } catch (err) {
            console.error('Failed to sync level with GamePush:', err);
        }
    }
    
    // Возвращаем локальный уровень
    return localLevel;
}

// Сохранение ТОЛЬКО локально (без GamePush)
export function saveLocalLevel(level) {
    localStorage.setItem('level', level.toString());
}

export async function saveLevel(level) {
    // Всегда сохраняем локально
    localStorage.setItem('level', level.toString());
    
    // Попробуем использовать GamePush если он доступен
    if (window.gp && window.gp.player) {
        try {
            // КРИТИЧЕСКИ ВАЖНО: ждем готовности player
            await window.gp.player.ready;
            
            // Сохраняем в GamePush
            window.gp.player.set('level', level);
            
            // Синхронизируем с облаком
            await window.gp.player.sync();
        } catch (err) {
            console.error('Failed to sync level to GamePush:', err);
        }
    }
}

export async function loadBestScore() {
    // Сначала загружаем из localStorage (локальное хранение)
    const localScore = localStorage.getItem('bestScore');
    const localBestScore = localScore ? parseInt(localScore, 10) : 0;
    
    // Ждем немного, если GamePush еще не готов
    if (!window.gp || !window.gp.player) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Ждем 1 секунду
    }
    
    // Попробуем использовать GamePush если он доступен
    if (window.gp && window.gp.player) {
        try {
            // КРИТИЧЕСКИ ВАЖНО: ждем готовности player
            await window.gp.player.ready;
            
            // Загружаем best_score из GamePush (без лишнего sync)
            const cloudBestScore = window.gp.player.get('best_score');
            
            if (cloudBestScore !== null && cloudBestScore !== undefined) {
                const cloudScore = cloudBestScore || 0;
                
                // Берем максимальное значение между локальным и облачным
                const maxScore = Math.max(localBestScore, cloudScore);
                
                // ВСЕГДА обновляем локальное хранилище максимальным значением
                localStorage.setItem('bestScore', maxScore.toString());
                
                // Если локальный счет больше облачного - помечаем для синхронизации
                // (синхронизация произойдет при следующем сохранении)
                if (localBestScore > cloudScore) {
                    // Не синхронизируем сразу, чтобы не создавать лишние запросы при загрузке
                }
                
                return maxScore;
            }
        } catch (err) {
            console.error('Failed to sync with GamePush:', err);
        }
    }
    
    // Возвращаем локальный счет
    return localBestScore;
}

// Сохранение ТОЛЬКО локально (без GamePush)
export function saveLocalBestScore(score) {
    localStorage.setItem('bestScore', score.toString());
}

export async function saveBestScore(score) {
    // Всегда сохраняем локально
    localStorage.setItem('bestScore', score.toString());
    
    // Попробуем использовать GamePush если он доступен
    if (window.gp && window.gp.player) {
        try {
            // КРИТИЧЕСКИ ВАЖНО: ждем готовности player
            await window.gp.player.ready;
            
            // Сохраняем в GamePush
            window.gp.player.set('best_score', score);
            
            // Синхронизируем с облаком
            await window.gp.player.sync();
        } catch (err) {
            console.error('Failed to sync to GamePush:', err);
        }
    }
}

// Функция для принудительной синхронизации с GamePush
export async function syncWithGamePush() {
    if (window.gp && window.gp.player) {
        try {
            // КРИТИЧЕСКИ ВАЖНО: ждем готовности player
            await window.gp.player.ready;
            
            await window.gp.player.sync();
        } catch (err) {
            console.error('Failed to sync with GamePush:', err);
        }
    }
}


// Загрузка монет
export async function loadCoins() {
    // Сначала загружаем из localStorage
    const localCoins = localStorage.getItem('coins');
    const localCoinsValue = localCoins ? parseInt(localCoins, 10) : 0;
    
    // Ждем немного, если GamePush еще не готов
    if (!window.gp || !window.gp.player) {
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Попробуем использовать GamePush если он доступен
    if (window.gp && window.gp.player) {
        try {
            await window.gp.player.ready;
            
            const cloudCoins = window.gp.player.get('coins');
            
            if (cloudCoins !== null && cloudCoins !== undefined) {
                const cloudCoinsValue = cloudCoins || 0;
                
                // Берем максимальное значение
                const maxCoins = Math.max(localCoinsValue, cloudCoinsValue);
                
                // Обновляем локальное хранилище
                localStorage.setItem('coins', maxCoins.toString());
                
                // Если локальные монеты больше - помечаем для синхронизации
                // (синхронизация произойдет при следующем сохранении)
                if (localCoinsValue > cloudCoinsValue) {
                    // Не синхронизируем сразу, чтобы не создавать лишние запросы при загрузке
                }
                
                return maxCoins;
            }
        } catch (err) {
            console.error('Failed to sync coins with GamePush:', err);
        }
    }
    
    return localCoinsValue;
}

// Сохранение монет локально
export function saveLocalCoins(coins) {
    localStorage.setItem('coins', coins.toString());
}

// Сохранение монет в GamePush
export async function saveCoins(coins) {
    // Всегда сохраняем локально
    localStorage.setItem('coins', coins.toString());
    
    // Попробуем использовать GamePush если он доступен
    if (window.gp && window.gp.player) {
        try {
            await window.gp.player.ready;
            
            window.gp.player.set('coins', coins);
            
            await window.gp.player.sync();
        } catch (err) {
            console.error('Failed to sync coins to GamePush:', err);
        }
    }
}

// Загрузка статистики игрока (rank, score, kills, deaths)
export async function loadPlayerStats() {
    const stats = {
        score: 0,
        rank: 1,
        kills: 0,
        deaths: 0
    };
    
    // Загружаем из localStorage
    const localScore = localStorage.getItem('score');
    const localRank = localStorage.getItem('rank');
    const localKills = localStorage.getItem('kills');
    const localDeaths = localStorage.getItem('deaths');
    
    if (localScore) stats.score = parseInt(localScore, 10) || 0;
    if (localRank) stats.rank = parseInt(localRank, 10) || 1;
    if (localKills) stats.kills = parseInt(localKills, 10) || 0;
    if (localDeaths) stats.deaths = parseInt(localDeaths, 10) || 0;
    
    // Ждем GamePush
    if (!window.gp || !window.gp.player) {
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Синхронизируем с GamePush
    if (window.gp && window.gp.player) {
        try {
            await window.gp.player.ready;
            
            const cloudScore = window.gp.player.get('score') || 0;
            const cloudRank = window.gp.player.get('rank') || 1;
            const cloudKills = window.gp.player.get('kills') || 0;
            const cloudDeaths = window.gp.player.get('deaths') || 0;
            
            // Берем максимальные значения
            stats.score = Math.max(stats.score, cloudScore);
            stats.rank = Math.max(stats.rank, cloudRank);
            stats.kills = Math.max(stats.kills, cloudKills);
            stats.deaths = Math.max(stats.deaths, cloudDeaths);
            
            // Сохраняем локально
            localStorage.setItem('score', stats.score.toString());
            localStorage.setItem('rank', stats.rank.toString());
            localStorage.setItem('kills', stats.kills.toString());
            localStorage.setItem('deaths', stats.deaths.toString());
            
            // Если локальные больше - помечаем для синхронизации
            // (синхронизация произойдет при следующем сохранении)
            if (stats.score > cloudScore || stats.rank > cloudRank || stats.kills > cloudKills || stats.deaths > cloudDeaths) {
                // Не синхронизируем сразу, чтобы не создавать лишние запросы при загрузке
            }
        } catch (err) {
            console.error('Failed to sync player stats with GamePush:', err);
        }
    }
    
    return stats;
}

// Сохранение статистики локально
export function saveLocalPlayerStats(stats) {
    localStorage.setItem('score', stats.score.toString());
    localStorage.setItem('rank', stats.rank.toString());
    localStorage.setItem('kills', stats.kills.toString());
    localStorage.setItem('deaths', stats.deaths.toString());
}

// Сохранение статистики в GamePush
export async function savePlayerStats(stats) {
    // Всегда сохраняем локально
    saveLocalPlayerStats(stats);
    
    // Пытаемся синхронизировать с GamePush
    if (window.gp && window.gp.player) {
        try {
            await window.gp.player.ready;
            
            window.gp.player.set('score', stats.score);
            window.gp.player.set('rank', stats.rank);
            window.gp.player.set('kills', stats.kills);
            window.gp.player.set('deaths', stats.deaths);
            
            await window.gp.player.sync();
        } catch (err) {
            console.error('Failed to sync player stats to GamePush:', err);
        }
    }
}

// Функция для сброса данных GamePush
export async function resetGamePush() {
    if (!window.gp || !window.gp.player) {
        console.error('GamePush not available for reset');
        return false;
    }
    
    try {
        // Ждем готовности player
        await window.gp.player.ready;
        
        // Сбрасываем все поля в GamePush
        window.gp.player.set('best_score', 0);
        window.gp.player.set('level', 1);
        window.gp.player.set('coins', 0);
        window.gp.player.set('score', 0);
        window.gp.player.set('rank', 1);
        window.gp.player.set('kills', 0);
        window.gp.player.set('deaths', 0);
        window.gp.player.set('upgrades', '{}'); // Очищаем все купленные апгрейды
        
        // Синхронизируем сброс
        await window.gp.player.sync();
        
        // Также сбрасываем локальное хранилище
        localStorage.removeItem('bestScore');
        localStorage.removeItem('level');
        localStorage.removeItem('coins');
        localStorage.removeItem('score');
        localStorage.removeItem('rank');
        localStorage.removeItem('kills');
        localStorage.removeItem('deaths');
        localStorage.removeItem('shopPurchases'); // Очищаем покупки из магазина
        
        return true;
        
    } catch (err) {
        console.error('Reset failed:', err);
        return false;
    }
}


