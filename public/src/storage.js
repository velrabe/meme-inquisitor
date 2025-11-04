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
                
                // Если локальный уровень больше облачного - сохраняем в GamePush
                if (localLevel > cloudLevelNum) {
                    window.gp.player.set('level', localLevel);
                    await window.gp.player.sync();
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
                
                // Если локальный счет больше облачного - сохраняем в GamePush
                if (localBestScore > cloudScore) {
                    window.gp.player.set('best_score', localBestScore);
                    await window.gp.player.sync();
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


// Функция для сброса данных GamePush
export async function resetGamePush() {
    if (!window.gp || !window.gp.player) {
        console.error('GamePush not available for reset');
        return false;
    }
    
    try {
        // Ждем готовности player
        await window.gp.player.ready;
        
        // Сбрасываем best_score и level в GamePush
        window.gp.player.set('best_score', 0);
        window.gp.player.set('level', 1);
        
        // Синхронизируем сброс
        await window.gp.player.sync();
        
        // Также сбрасываем локальное хранилище
        localStorage.removeItem('bestScore');
        localStorage.removeItem('level');
        
        return true;
        
    } catch (err) {
        console.error('Reset failed:', err);
        return false;
    }
}


