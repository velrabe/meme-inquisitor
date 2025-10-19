// Модуль управления
let leftPressed = false;
let rightPressed = false;
let dragging = false;
let dragX = 0;

export function initInput() {
    // Клавиатура
    window.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft' || 
            e.key.toLowerCase() === 'a' || 
            e.key.toLowerCase() === 'ф' || // русская 'a'
            e.code === 'KeyA') {
            leftPressed = true;
        }
        if (e.key === 'ArrowRight' || 
            e.key.toLowerCase() === 'd' || 
            e.key.toLowerCase() === 'в' || // русская 'd'
            e.code === 'KeyD') {
            rightPressed = true;
        }
    });
    
    window.addEventListener('keyup', (e) => {
        if (e.key === 'ArrowLeft' || 
            e.key.toLowerCase() === 'a' || 
            e.key.toLowerCase() === 'ф' || // русская 'a'
            e.code === 'KeyA') {
            leftPressed = false;
        }
        if (e.key === 'ArrowRight' || 
            e.key.toLowerCase() === 'd' || 
            e.key.toLowerCase() === 'в' || // русская 'd'
            e.code === 'KeyD') {
            rightPressed = false;
        }
    });
    
    // Мобильные стрелки
    const leftArrow = document.getElementById('leftArrow');
    const rightArrow = document.getElementById('rightArrow');
    
    // Touch события для стрелок
    leftArrow.addEventListener('touchstart', (e) => {
        e.preventDefault();
        leftPressed = true;
    });
    
    leftArrow.addEventListener('touchend', (e) => {
        e.preventDefault();
        leftPressed = false;
    });
    
    rightArrow.addEventListener('touchstart', (e) => {
        e.preventDefault();
        rightPressed = true;
    });
    
    rightArrow.addEventListener('touchend', (e) => {
        e.preventDefault();
        rightPressed = false;
    });
    
    // Mouse события для стрелок (для тестирования на десктопе)
    leftArrow.addEventListener('mousedown', () => leftPressed = true);
    leftArrow.addEventListener('mouseup', () => leftPressed = false);
    leftArrow.addEventListener('mouseleave', () => leftPressed = false);
    
    rightArrow.addEventListener('mousedown', () => rightPressed = true);
    rightArrow.addEventListener('mouseup', () => rightPressed = false);
    rightArrow.addEventListener('mouseleave', () => rightPressed = false);
    
    // Drag персонажа
    const canvas = document.getElementById('gameCanvas');
    
    canvas.addEventListener('touchstart', handleDragStart);
    canvas.addEventListener('touchmove', handleDragMove);
    canvas.addEventListener('touchend', handleDragEnd);
    
    canvas.addEventListener('mousedown', handleDragStart);
    canvas.addEventListener('mousemove', handleDragMove);
    canvas.addEventListener('mouseup', handleDragEnd);
}

function handleDragStart(e) {
    const pos = getEventPosition(e);
    // Проверяем, кликнули ли по игроку (это будет сделано в player.js)
    dragging = true;
    dragX = pos.x;
}

function handleDragMove(e) {
    if (dragging) {
        e.preventDefault();
        const pos = getEventPosition(e);
        dragX = pos.x;
    }
}

function handleDragEnd(e) {
    dragging = false;
}

function getEventPosition(e) {
    const canvas = document.getElementById('gameCanvas');
    const rect = canvas.getBoundingClientRect();
    
    let clientX, clientY;
    
    if (e.touches && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
    } else {
        clientX = e.clientX;
        clientY = e.clientY;
    }
    
    return {
        x: clientX - rect.left,
        y: clientY - rect.top
    };
}

export function getInput() {
    return {
        left: leftPressed,
        right: rightPressed,
        dragging,
        dragX
    };
}

export function resetInput() {
    leftPressed = false;
    rightPressed = false;
    dragging = false;
}

