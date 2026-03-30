/* eslint-disable @typescript-eslint/no-require-imports */
const { execSync } = require('child_process');

console.log('Generating Prisma Client...');
try {
  execSync('npx prisma generate', { stdio: 'inherit', cwd: __dirname });
  console.log('\n✓ Prisma Client generated successfully!');
  console.log('\nYou can now run: npm run dev');
} catch (error) {
  console.error('Error generating Prisma Client:', error.message);
  process.exit(1);
}
