@echo off
echo Generating Prisma Client...
call npx prisma generate
echo.
echo Pushing database schema...
call npx prisma db push
echo.
echo Done! You can now run: npm run dev
pause
