import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { resetDatabase, seedDatabase } from './prisma/test-seed';

const TEST_DB_PATH = path.resolve(__dirname, 'test.db');

export default async () => {
  if (fs.existsSync(TEST_DB_PATH)) {
    fs.unlinkSync(TEST_DB_PATH);
  }

  process.env.DATABASE_URL = `file:${TEST_DB_PATH}`;

  execSync(`npx prisma db push`, {
    env: {
      ...process.env,
      DATABASE_URL: `file:${TEST_DB_PATH}`,
    },
    stdio: 'inherit',
  });

  await resetDatabase();
  await seedDatabase();

  fs.writeFileSync('.test-db-path', TEST_DB_PATH);
};
