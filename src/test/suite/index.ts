import { glob } from 'node:fs/promises';

import Mocha from 'mocha';
import * as path from 'path';

export async function run(): Promise<void> {
  try {
    const mocha: Mocha = new Mocha({
      ui: 'bdd',
      color: true,
    });

    const root = path.resolve(__dirname, '..');

    for await (const file of glob('**/**.test.js', { cwd: root })) {
      mocha.addFile(path.resolve(root, file));
    }

    return new Promise((resolve, reject) => {
      mocha.run((failures: number) => {
        if (failures > 0) {
          reject(new Error(`${failures} tests failed.`));
        } else {
          resolve();
        }
      });
    });
  } catch (error: unknown) {
    console.error('Test runner encountered an error:', error);
    throw error;
  }
}
