@echo off
setlocal

echo Saved-Brain starter for Windows
echo ================================

if not exist node_modules (
  echo Installing dependencies...
  call npm install
  if errorlevel 1 goto :err
)

if not exist .env (
  echo Creating .env from example...
  copy .env.example .env
)

echo Setting up local SQLite DB...
call npx tsx scripts/setup-db.ts
if errorlevel 1 goto :err

echo Starting dev server...
call npm run dev
if errorlevel 1 goto :err

goto :end

:err
echo Something went wrong. Check Node version (needs 18+) and npm.
pause
exit /b 1

:end
endlocal
