/**
 * Copyright (c) 2026 deep.rent GmbH (https://deep.rent).
 * Licensed under the MIT License.
 */

import * as assert from 'node:assert';
import * as path from 'node:path';

import * as vscode from 'vscode';

import { Action } from '../../action';
import { Command } from '../../command';
import { Resource } from '../../resource';

describe('Command', () => {
  it('creates command line and options from action and resource', () => {
    const action: Action = new Action({
      name: 'Test',
      command: 'echo ${fileBasename}',
      shell: '/bin/bash',
    });
    const resource: Resource = new Resource(vscode.Uri.file('/foo/test.txt'));
    const command: Command = Command.create(action, resource);

    assert.strictEqual(command.name, 'Test');
    assert.strictEqual(command.commandLine, 'echo test.txt');
    assert.strictEqual(command.options.shell, '/bin/bash');
    assert.strictEqual(command.options.cwd, resource.workspaceFolder);
  });

  it('creates command with custom cwd and env options', () => {
    const action: Action = new Action({
      name: 'CustomEnv',
      command: 'echo 1',
      cwd: '${workspaceFolder}/sub',
      env: { testKey: 'testValue' },
    });
    const resource: Resource = new Resource(vscode.Uri.file('/foo/test.txt'));
    const command: Command = Command.create(action, resource);

    assert.strictEqual(
      command.options.cwd,
      path.resolve(resource.workspaceFolder, 'sub'),
    );
    assert.deepStrictEqual(command.options.env, { testKey: 'testValue' });
  });
});
