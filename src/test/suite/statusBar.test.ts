/**
 * Copyright (c) 2026 deep.rent GmbH (https://deep.rent).
 * Licensed under the MIT License.
 */

import * as assert from 'node:assert';

import type * as vscode from 'vscode';

import { StatusBarManager } from '../../statusBar';

describe('StatusBarManager', () => {
  it('initializes in enabled state and toggles properly', () => {
    const subscriptions: vscode.Disposable[] = [];
    const context = {
      subscriptions,
    } as unknown as vscode.ExtensionContext;

    const manager = new StatusBarManager(context);
    assert.strictEqual(manager.isEnabled(), true);
    assert.strictEqual(subscriptions.length, 1);

    const toggled = manager.toggle();
    assert.strictEqual(toggled, false);
    assert.strictEqual(manager.isEnabled(), false);

    manager.setEnabled(true);
    assert.strictEqual(manager.isEnabled(), true);
  });
});
