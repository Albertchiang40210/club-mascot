@echo off
chcp 65001 >nul
title Xiao Guang Game
cd /d "%~dp0game"
if not exist node_modules (
  echo First run: installing...
  call npm install
)
echo Game server starting. Close this window to stop the game.
call npm run dev -- --open
