/**
 * Copyright (c) 2026 deep.rent GmbH (https://deep.rent).
 * Licensed under the MIT License.
 */

import { runTests } from '@vscode/test-electron';
import * as path from 'path';

async function main(): Promise<void> {
  try {
    const extensionDevelopmentPath = path.resolve(__dirname, '../../');
    const extensionTestsPath = path.resolve(__dirname, './suite/index');
    const version = process.env.VSCODE_VERSION ?? '1.107.0';

    await runTests({
      version,
      extensionDevelopmentPath,
      extensionTestsPath,
    });
  } catch (err) {
    console.error('Failed to run tests', err);
    process.exit(1);
  }
}

main();
