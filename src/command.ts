/**
 * Copyright (c) 2026 deep.rent GmbH (https://deep.rent).
 * Licensed under the MIT License.
 */

import type { Action } from './action';
import type { Resource } from './resource';

type Options = {
  cwd: string;
  shell?: string | undefined;
  timeout?: number | undefined;
  env?: Record<string, string> | undefined;
};

/**
 * Encapsulates the execution command line and shell environment parameters.
 */
export class Command {
  /**
   * Initializes a new instance with action details and execution parameters.
   *
   * @param name - The descriptive name of the associated action.
   * @param commandLine - The resolved command string to execute in the shell.
   * @param options - The execution context parameters.
   */
  constructor(
    public readonly name: string,
    public readonly commandLine: string,
    public readonly options: Options,
  ) {}

  /**
   * Constructs an executable command resolved from a given action and resource.
   *
   * @param action - The triggered action to run.
   * @param resource - The resource path metadata provider.
   * @returns A new command instance.
   */
  public static create(action: Action, resource: Resource): Command {
    return new Command(action.name, action.getCommand(resource), {
      cwd: action.getCwd(resource),
      shell: action.shell,
      timeout: action.timeout,
      env: action.getEnv(resource),
    });
  }
}
