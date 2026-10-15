import * as dotenv from 'dotenv';
dotenv.config();
import { runSeed } from './seed.ts';

runSeed()
  .then(() => {
    console.log('Seed executed successfully');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  });
