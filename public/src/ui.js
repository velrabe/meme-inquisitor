// UI управление
export class UI {
    constructor() {
        this.scoreElement = document.getElementById('scoreValue');
        this.bestScoreElement = document.getElementById('bestValue');
        this.levelElement = document.getElementById('levelValue');
        this.wavesElement = document.getElementById('wavesValue');
        this.loseScreen = document.getElementById('loseScreen');
        this.finalScoreElement = document.getElementById('finalScore');
        this.finalBestElement = document.getElementById('finalBest');
        this.restartBtn = document.getElementById('restartBtn');
    }
    
    updateScore(score) {
        this.scoreElement.textContent = score;
    }
    
    updateBestScore(best) {
        this.bestScoreElement.textContent = best;
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

