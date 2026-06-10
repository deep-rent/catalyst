import * as cp from 'child_process';
import * as vscode from 'vscode';

import type { Command } from './command';
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
export type ExecuteCallback = typeof cp.exec;

/**
 * Type alias for the error message dialog presenter function.
 */
export type ShowErrorMessageCallback = typeof vscode.window.showErrorMessage;

/**
 * Spawns a shell process to execute task commands.
 */
class ShellExecutor implements Executor {
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
      logger.send(
        Level.info,
        `Running action '${cmd.name}': ${cmd.commandLine}`,
      );

      const startTime: number = Date.now();

      this.executeCallback(
        cmd.commandLine,
        cmd.options,
        (
          error: cp.ExecException | null,
          stdout: string | Buffer<ArrayBufferLike>,
          stderr: string | Buffer<ArrayBufferLike>,
        ) => {
          const duration: number = Date.now() - startTime;

          if (stdout) {
            logger.send(Level.info, `[${cmd.name} - stdout]:\n${stdout}`);
          }
          if (stderr) {
            logger.send(Level.error, `[${cmd.name} - stderr]:\n${stderr}`);
          }

          if (error) {
            const code: number = error.code ?? -1;
            logger.send(
              Level.error,
              `Action '${cmd.name}' failed with exit code ${code} ` +
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
          } else {
            logger.send(
              Level.info,
              `Action '${cmd.name}' completed successfully in ${duration}ms.`,
            );
          }

          resolve();
        },
      );
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
  executeCallback: ExecuteCallback = cp.exec,
  showErrorMessageCallback: ShowErrorMessageCallback = vscode.window
    .showErrorMessage,
): Executor => {
  return new ShellExecutor(executeCallback, showErrorMessageCallback);
};
