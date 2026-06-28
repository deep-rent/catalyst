/**
 * Copyright (c) 2026 deep.rent GmbH (https://deep.rent).
 * Licensed under the MIT License.
 */

import * as assert from 'node:assert';
import { EventEmitter } from 'node:events';

import type * as cp from 'child_process';
import * as vscode from 'vscode';

import { Action } from '../../action';
import { Command } from '../../command';
import type {
  ExecuteCallback,
  Executor,
  ShowErrorMessageCallback,
} from '../../executor';
import { createExecutor } from '../../executor';
import { Resource } from '../../resource';

describe('Executor', () => {
  it('executes a command successfully', async () => {
    let executed: string = '';
    const executeCallback = (
      cmd: string,
      _opts: cp.SpawnOptions,
    ): any => {
      executed = cmd;
      const child = new EventEmitter();
      (child as any).stdout = new EventEmitter();
      (child as any).stderr = new EventEmitter();

      process.nextTick(() => {
        (child as any).stdout.emit('data', Buffer.from('stdout'));
        child.emit('close', 0);
      });

      return child;
    };

    const executor: Executor = createExecutor(
      executeCallback as ExecuteCallback,
    );
    const action: Action = new Action({ command: 'echo success' });
    const resource: Resource = new Resource(vscode.Uri.file('/test'));
    const command: Command = Command.create(action, resource);

    await executor.execute(command);
    assert.strictEqual(executed, 'echo success');
  });

  it('handles execution failure', async () => {
    let shown: boolean = false;
    const executeCallback = (
      _cmd: string,
      _opts: cp.SpawnOptions,
    ): any => {
      const child = new EventEmitter();
      (child as any).stdout = new EventEmitter();
      (child as any).stderr = new EventEmitter();

      process.nextTick(() => {
        (child as any).stderr.emit('data', Buffer.from('stderr'));
        child.emit('close', 1);
      });

      return child;
    };

    const showErrorMessageCallback: ShowErrorMessageCallback = async () => {
      shown = true;
      return undefined;
    };

    const executor: Executor = createExecutor(
      executeCallback as ExecuteCallback,
      showErrorMessageCallback,
    );
    const action: Action = new Action({ command: 'echo fail' });
    const resource: Resource = new Resource(vscode.Uri.file('/test'));
    const command: Command = Command.create(action, resource);

    await executor.execute(command);
    assert.strictEqual(shown, true);
  });
});
