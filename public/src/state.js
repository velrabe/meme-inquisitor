// Управление состояниями игры
const GameState = {
    PLAYING: 'playing',
    PAUSED: 'paused',
    LOSE: 'lose'
};

let currentState = GameState.PLAYING;

export function getState() {
    return currentState;
}

export function setState(newState) {
    currentState = newState;
}

export function isPlaying() {
    return currentState === GameState.PLAYING;
}

export function isPaused() {
    return currentState === GameState.PAUSED;
}

export function isLose() {
    return currentState === GameState.LOSE;
}

export { GameState };

