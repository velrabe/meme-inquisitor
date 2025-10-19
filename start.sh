#!/bin/bash

echo "🎮 Starting Meme Inquisitor..."
echo ""
echo "Server will start at http://localhost:8000"
echo "Press Ctrl+C to stop the server"
echo ""

cd public

# Проверяем доступность python3
if command -v python3 &> /dev/null; then
    python3 -m http.server 8000
elif command -v python &> /dev/null; then
    python -m http.server 8000
else
    echo "Python не найден. Установите Python или используйте другой HTTP сервер."
    exit 1
fi

