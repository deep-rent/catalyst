/**
 * Copyright (c) 2026 deep.rent GmbH (https://deep.rent).
 * Licensed under the MIT License.
 */

import * as assert from 'node:assert';

import * as vscode from 'vscode';

import { Action } from '../../action';
import { Platform } from '../../config';
import { Resource } from '../../resource';

describe('Action', () => {
  it('initializes with string command', () => {
    const action: Action = new Action({ command: 'echo test' });
    assert.strictEqual(action.name, 'Unknown');
  });

  it('initializes with object command for specific platform', () => {
    const action: Action = new Action(
      { command: { windows: 'echo win', default: 'echo def' } },
      Platform.windows,
    );
    const resource: Resource = new Resource(vscode.Uri.file('/test'));
    assert.strictEqual(action.getCommand(resource), 'echo win');
  });

  it('throws when command is invalid', () => {
    assert.throws(() => {
      new Action({ command: undefined as unknown as string });
    }, /Missing or invalid command option/);
  });

  it('matches files based on include and exclude globs', () => {
    const action: Action = new Action({
      command: 'echo test',
      include: ['**/*.ts'],
      exclude: ['**/*.spec.ts'],
    });

    assert.strictEqual(action.matches('/src/index.ts'), true);
    assert.strictEqual(action.matches('/src/index.spec.ts'), false);
    assert.strictEqual(action.matches('/src/index.js'), false);
  });

  it('substitutes variables in command template', () => {
    const action: Action = new Action({ command: 'echo ${fileBasename}' });
    const resource: Resource = new Resource(vscode.Uri.file('/foo/bar.ts'));
    assert.strictEqual(action.getCommand(resource), 'echo bar.ts');
  });

  it('parses timeout configuration correctly', () => {
    const validAction = new Action({ command: 'echo test', timeout: 5000 });
    assert.strictEqual(validAction.timeout, 5000);

    const invalidAction = new Action({ command: 'echo test', timeout: -100 });
    assert.strictEqual(invalidAction.timeout, undefined);
  });

  it('parses and resolves custom cwd and env configuration', () => {
    const action = new Action({
      command: 'echo test',
      cwd: '${workspaceFolder}/custom',
      env: { testKey: 'bar_${fileBasenameNoExtension}' },
    });
    const resource = new Resource(vscode.Uri.file('/workspace/src/file.ts'));

    assert.strictEqual(
      action.getCwd(resource),
      `${resource.workspaceFolder}/custom`,
    );
    assert.deepStrictEqual(action.getEnv(resource), { testKey: 'bar_file' });
  });
});
