/**
 * Copyright (c) 2026 deep.rent GmbH (https://deep.rent).
 * Licensed under the MIT License.
 */

import * as cp from 'node:child_process';

import * as vscode from 'vscode';

import type { Command } from './command';
import { getShowOutput } from './config';
import { EXTENSION_NAME } from './constants';
import { Level, logger } from './logger';

/**
 * Interface representing a task execution engine.
 */
export interface Executor {
  /**
   * Runs the provided command.
   *
   * @param command - The command to be executed.
   * @returns A promise that resolves when execution completes.
   */
  execute(command: Command): Promise<void>;
}

/**
 * Type alias for the child process executor function.
 */
export type ExecuteCallback = (
  command: string,
  options: cp.SpawnOptions,
) => cp.ChildProcess;

/**
 * Type alias for the error message dialog presenter function.
 */
export type ShowErrorMessageCallback = typeof vscode.window.showErrorMessage;

/**
 * Buffers streaming text chunks into complete newline-terminated lines.
 */
export class LineBuffer {
  private buffer = '';

  /**
   * Constructs a line buffer with a callback for complete lines.
   *
   * @param onLine - Callback invoked for each full line.
   */
  constructor(private readonly onLine: (line: string) => void) {}

  /**
   * Appends a data chunk and emits any complete lines.
   *
   * @param chunk - The text chunk to process.
   */
  public append(chunk: string): void {
    this.buffer += chunk;
    const lines = this.buffer.split('\n');
    this.buffer = lines.pop() ?? '';
    for (const line of lines) {
      this.onLine(line);
    }
  }

  /**
   * Flushes any remaining incomplete line buffer.
   */
  public flush(): void {
    if (this.buffer.length > 0) {
      this.onLine(this.buffer);
      this.buffer = '';
    }
  }
}

/**
 * Spawns a shell process to execute task commands.
 */
class ShellExecutor implements Executor {
  private readonly processes = new Map<
    string,
    { child: cp.ChildProcess; wasCancelled: boolean }
  >();

  /**
   * Constructs a new instance with injectable execution dependencies.
   *
   * @param executeCallback - Customizable child process executor.
   * @param showErrorMessageCallback - Customizable error dialog presenter.
   */
  constructor(
    private readonly executeCallback: ExecuteCallback,
    private readonly showErrorMessageCallback: ShowErrorMessageCallback,
  ) {}

  /**
   * Runs the command line inside a child process, logging output and
   * failure logs.
   *
   * @param cmd - The command object detailing options and command line.
   * @returns A promise resolving when the child process exits.
   */
  public execute(cmd: Command): Promise<void> {
    return new Promise((resolve) => {
      const existing = this.processes.get(cmd.name);
      if (existing !== undefined) {
        existing.wasCancelled = true;
        logger.send(
          Level.info,
          `Action '${cmd.name}' re-triggered; cancelling previous execution.`,
        );
        existing.child.kill('SIGTERM');
      }

      const showOutputMode = getShowOutput();

      if (showOutputMode === 'always') {
        logger.show();
      }

      logger.send(
        Level.info,
        `Running action '${cmd.name}': ${cmd.commandLine}`,
      );

      const startTime: number = Date.now();

      const spawnEnv =
        cmd.options.env !== undefined
          ? { ...process.env, ...cmd.options.env }
          : undefined;

      const child = this.executeCallback(cmd.commandLine, {
        cwd: cmd.options.cwd,
        shell: cmd.options.shell ?? true,
        env: spawnEnv,
      });

      const activeProcess = { child, wasCancelled: false };
      this.processes.set(cmd.name, activeProcess);

      let timer: NodeJS.Timeout | undefined;
      let timedOut = false;

      if (cmd.options.timeout !== undefined && cmd.options.timeout > 0) {
        timer = setTimeout(() => {
          timedOut = true;
          child.kill('SIGTERM');
        }, cmd.options.timeout);
      }

      const clearTimer = () => {
        if (timer !== undefined) {
          clearTimeout(timer);
          timer = undefined;
        }
      };

      const stdoutBuffer = new LineBuffer((line: string) => {
        logger.append(`${line}\n`);
      });

      const stderrBuffer = new LineBuffer((line: string) => {
        logger.append(`${line}\n`);
      });

      const flush = () => {
        stdoutBuffer.flush();
        stderrBuffer.flush();
      };

      const cleanup = () => {
        clearTimer();
        flush();
        if (this.processes.get(cmd.name) === activeProcess) {
          this.processes.delete(cmd.name);
        }
      };

      const showError = () => {
        if (showOutputMode === 'onError' || showOutputMode === 'always') {
          logger.show();
        }
      };

      if (child.stdout) {
        logger.send(Level.info, `[${cmd.name} - stdout]:`);
        child.stdout.on('data', (data: Buffer | string) => {
          stdoutBuffer.append(data.toString());
        });
      }

      if (child.stderr) {
        logger.send(Level.error, `[${cmd.name} - stderr]:`);
        child.stderr.on('data', (data: Buffer | string) => {
          stderrBuffer.append(data.toString());
        });
      }

      let errorOccurred = false;

      child.on('error', (error: Error & { code?: string | number }) => {
        cleanup();
        if (activeProcess.wasCancelled) {
          resolve();
          return;
        }
        showError();
        errorOccurred = true;
        const duration: number = Date.now() - startTime;
        const code = error.code ?? -1;

        logger.send(
          Level.error,
          `Action '${cmd.name}' failed to spawn with code ${code} ` +
            `after ${duration}ms.`,
          error,
        );

        if (
          vscode.workspace
            .getConfiguration(EXTENSION_NAME)
            .get<boolean>('showErrorPopups', true)
        ) {
          const button = 'Show Logs';
          this.showErrorMessageCallback(
            `${logger.name}: Action '${cmd.name}' failed (code ${code}).`,
            button,
          ).then((selection) => {
            if (selection === button) {
              logger.show();
            }
          });
        }
        resolve();
      });

      child.on('close', (code: number | null) => {
        cleanup();
        if (errorOccurred) {
          resolve();
          return;
        }

        if (activeProcess.wasCancelled) {
          logger.send(
            Level.info,
            `Action '${cmd.name}' cancelled prior to completion.`,
          );
          resolve();
          return;
        }

        const duration: number = Date.now() - startTime;

        if (timedOut) {
          showError();
          logger.send(
            Level.error,
            `Action '${cmd.name}' timed out after ${cmd.options.timeout}ms.`,
          );

          if (
            vscode.workspace
              .getConfiguration(EXTENSION_NAME)
              .get<boolean>('showErrorPopups', true)
          ) {
            const button = 'Show Logs';
            this.showErrorMessageCallback(
              `${logger.name}: Action '${cmd.name}' timed out.`,
              button,
            ).then((selection) => {
              if (selection === button) {
                logger.show();
              }
            });
          }
        } else if (code !== 0) {
          showError();
          logger.send(
            Level.error,
            `Action '${cmd.name}' failed with exit code ${code} ` +
              `after ${duration}ms.`,
          );

          if (
            vscode.workspace
              .getConfiguration(EXTENSION_NAME)
              .get<boolean>('showErrorPopups', true)
          ) {
            const button = 'Show Logs';
            this.showErrorMessageCallback(
              `${logger.name}: Action '${cmd.name}' failed (code ${code}).`,
              button,
            ).then((selection) => {
              if (selection === button) {
                logger.show();
              }
            });
          }
        } else {
          logger.send(
            Level.info,
            `Action '${cmd.name}' completed successfully in ${duration}ms.`,
          );
        }

        resolve();
      });
    });
  }
}

/**
 * Factory function for creating a default executor instance.
 *
 * Takes optional callbacks to facilitate mocking.
 *
 * @param executeCallback - Customizable child process executor.
 * @param showErrorMessageCallback - Customizable error dialog presenter.
 *
 * @returns A new executor instance.
 */
export const createExecutor = (
  executeCallback: ExecuteCallback = cp.spawn as ExecuteCallback,
  showErrorMessageCallback: ShowErrorMessageCallback = vscode.window
    .showErrorMessage,
): Executor => {
  return new ShellExecutor(executeCallback, showErrorMessageCallback);
};
