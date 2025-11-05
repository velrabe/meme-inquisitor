// UI управление
import { getRankFromXP, getRankTitle, getStarsForRank } from './rank.js';

export class UI {
    constructor() {
        this.scoreElement = document.getElementById('scoreValue');
        this.rankElement = document.getElementById('rankValue');
        this.rankStarsElement = document.getElementById('rankStars');
        this.rankXPElement = document.getElementById('rankXP');
        this.levelElement = document.getElementById('levelValue');
        this.wavesElement = document.getElementById('wavesValue');
        this.coinsElement = document.getElementById('coinsValue');
        this.loseScreen = document.getElementById('loseScreen');
        this.finalScoreElement = document.getElementById('finalScore');
        this.finalBestElement = document.getElementById('finalBest');
        this.restartBtn = document.getElementById('restartBtn');
    }
    
    updateScore(score) {
        if (this.scoreElement) {
            this.scoreElement.textContent = score;
        }
    }
    
    updateBestScore(best) {
        // Метод оставляем для обратной совместимости, но ничего не делаем
        // так как best score убран из UI в пользу системы рангов
    }
    
    updateLevel(level) {
        if (this.levelElement) {
            this.levelElement.textContent = level;
        }
    }
    
    updateWaves(current, required) {
        if (this.wavesElement) {
            this.wavesElement.textContent = `${current}/${required}`;
        }
    }
    
    updateCoins(coins) {
        if (this.coinsElement) {
            this.coinsElement.textContent = coins;
        }
    }
    
    updateRank(rank, totalXP) {
        if (this.rankElement) {
            this.rankElement.textContent = rank;
        }
        
        // Обновляем звезды
        if (this.rankStarsElement) {
            const stars = getStarsForRank(rank);
            this.rankStarsElement.innerHTML = stars.map(star => {
                if (star.active) {
                    return `<span class="star active" style="color: ${star.color}">⭐</span>`;
                } else {
                    return `<span class="star inactive" style="color: ${star.color}; opacity: 0.3;">⭐</span>`;
                }
            }).join('');
        }
        
        // Обновляем прогресс XP
        if (this.rankXPElement) {
            const rankInfo = getRankFromXP(totalXP);
            this.rankXPElement.textContent = `${rankInfo.currentXP.toLocaleString()} / ${rankInfo.xpToNext.toLocaleString()}`;
        }
    }
    
    showLoseScreen(score, best) {
        this.finalScoreElement.textContent = score;
        this.finalBestElement.textContent = best;
        this.loseScreen.classList.remove('hidden');
    }
    
    hideLoseScreen() {
        this.loseScreen.classList.add('hidden');
    }
    
    onRestart(callback) {
        this.restartBtn.addEventListener('click', callback);
    }
}

