/* eslint-disable @typescript-eslint/no-require-imports */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Setting up database...');

const envPath = path.join(__dirname, '..', '.env');
if (!fs.existsSync(envPath)) {
  console.log('Creating .env file...');
  fs.writeFileSync(envPath, 'DATABASE_URL="file:./dev.db"\n');
}

try {
  console.log('Generating Prisma Client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  
  console.log('Pushing database schema...');
  execSync('npx prisma db push', { stdio: 'inherit' });
  
  console.log('Database setup complete!');
} catch (error) {
  console.error('Error setting up database:', error.message);
  process.exit(1);
}
