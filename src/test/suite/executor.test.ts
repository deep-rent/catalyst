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
import { createExecutor, LineBuffer } from '../../executor';
import { Resource } from '../../resource';

describe('Executor', () => {
  it('executes a command successfully', async () => {
    let executed: string = '';
    const executeCallback = (
      cmd: string,
      _opts: cp.SpawnOptions,
    ): cp.ChildProcess => {
      executed = cmd;
      const stdout = new EventEmitter();
      const stderr = new EventEmitter();
      const child = Object.assign(new EventEmitter(), {
        stdout,
        stderr,
      }) as unknown as cp.ChildProcess;

      process.nextTick(() => {
        stdout.emit('data', Buffer.from('stdout'));
        child.emit('close', 0);
      });

      return child;
    };

    const executor: Executor = createExecutor(executeCallback);
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
    ): cp.ChildProcess => {
      const stdout = new EventEmitter();
      const stderr = new EventEmitter();
      const child = Object.assign(new EventEmitter(), {
        stdout,
        stderr,
      }) as unknown as cp.ChildProcess;

      process.nextTick(() => {
        stderr.emit('data', Buffer.from('stderr'));
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

  it('handles execution timeout', async () => {
    let killed = false;
    let shownMessage: string | undefined;

    const executeCallback = (
      _cmd: string,
      _opts: cp.SpawnOptions,
    ): cp.ChildProcess => {
      const stdout = new EventEmitter();
      const stderr = new EventEmitter();
      const child = Object.assign(new EventEmitter(), {
        stdout,
        stderr,
        kill: (signal?: string) => {
          if (signal === 'SIGTERM') {
            killed = true;
            process.nextTick(() => {
              child.emit('close', null);
            });
          }
          return true;
        },
      }) as unknown as cp.ChildProcess;

      return child;
    };

    const showErrorMessageCallback: ShowErrorMessageCallback = async (
      msg: string,
    ) => {
      shownMessage = msg;
      return undefined;
    };

    const executor: Executor = createExecutor(
      executeCallback as ExecuteCallback,
      showErrorMessageCallback,
    );
    const action: Action = new Action({
      name: 'Timeout Task',
      command: 'sleep 10',
      timeout: 50,
    });
    const resource: Resource = new Resource(vscode.Uri.file('/test'));
    const command: Command = Command.create(action, resource);

    await executor.execute(command);
    assert.strictEqual(killed, true);
    assert.ok(
      shownMessage?.includes("Action 'Timeout Task' timed out."),
      `Expected message to contain timeout notice, got: ${shownMessage}`,
    );
  });

  it('passes custom env options to spawn', async () => {
    let capturedOptions: cp.SpawnOptions | undefined;
    const executeCallback = (
      _cmd: string,
      opts: cp.SpawnOptions,
    ): cp.ChildProcess => {
      capturedOptions = opts;
      const stdout = new EventEmitter();
      const stderr = new EventEmitter();
      const child = Object.assign(new EventEmitter(), {
        stdout,
        stderr,
      }) as unknown as cp.ChildProcess;

      process.nextTick(() => {
        child.emit('close', 0);
      });

      return child;
    };

    const executor: Executor = createExecutor(executeCallback);
    const action: Action = new Action({
      name: 'Env Task',
      command: 'echo 1',
      env: { testKey: 'testVal' },
    });
    const resource: Resource = new Resource(vscode.Uri.file('/test'));
    const command: Command = Command.create(action, resource);

    await executor.execute(command);
    assert.strictEqual(capturedOptions?.env?.testKey, 'testVal');
  });
});

describe('LineBuffer', () => {
  it('buffers chunks and emits complete lines', () => {
    const lines: string[] = [];
    const buffer = new LineBuffer((line) => lines.push(line));

    buffer.append('hello ');
    assert.deepStrictEqual(lines, []);

    buffer.append('world\nfoo\nbar');
    assert.deepStrictEqual(lines, ['hello world', 'foo']);

    buffer.flush();
    assert.deepStrictEqual(lines, ['hello world', 'foo', 'bar']);
  });
});
