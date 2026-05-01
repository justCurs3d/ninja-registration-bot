@echo off
echo Execute git pull...
git pull
if %errorlevel% neq 0 (
    echo git pull error.
    pause
    exit /b %errorlevel%
)

echo Execute git add...
git add .
if %errorlevel% neq 0 (
    echo git add error.
    pause
    exit /b %errorlevel%
)

echo Execute git commit...
git commit -m "Update, using update.bat"
if %errorlevel% neq 0 (
    echo git commit error.
    pause
    exit /b %errorlevel%
)

echo Execute git push origin main...
git push origin main
if %errorlevel% neq 0 (
    echo git push error.
    pause
    exit /b %errorlevel%
)

echo Success!
pause