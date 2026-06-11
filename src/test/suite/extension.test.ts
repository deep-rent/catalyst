/**
 * Copyright (c) 2026 deep.rent GmbH (https://deep.rent).
 * Licensed under the MIT License.
 */

import * as assert from 'node:assert';

import * as vscode from 'vscode';

import { EXTENSION_NAME } from '../../constants';

const publisher: string = 'deep-rent';

describe('Extension', () => {
  it('is active after starting up', async () => {
    const extension: vscode.Extension<unknown> | undefined =
      vscode.extensions.getExtension(`${publisher}.${EXTENSION_NAME}`);
    assert.ok(extension);

    if (!extension.isActive) {
      await extension.activate();
    }

    assert.strictEqual(extension.isActive, true);
  });
});
