/**
 * Copyright (c) 2026 deep.rent GmbH (https://deep.rent).
 * Licensed under the MIT License.
 */

import type { ActionConfig } from './config';
import { Platform } from './config';
import type { Matcher } from './matcher';
import { createMatcher } from './matcher';
import type { Resource } from './resource';

/**
 * Holds settings and rules to match file paths and build terminal commands.
 */
export class Action {
  /**
   * The display name of the action.
   */
  public readonly name: string;

  private readonly template: string;
  private readonly include: Matcher;
  private readonly exclude: Matcher;

  /**
   * The optional custom shell executable to use.
   */
  public readonly shell?: string | undefined;

  /**
   * The optional execution timeout in milliseconds.
   */
  public readonly timeout?: number | undefined;

  /**
   * Creates an action from the configuration and platform.
   *
   * @param config - The settings representing action parameters.
   * @param platform - The target OS used to resolve command lines.
   * @throws {@link Error} If the command is missing or invalid.
   */
  constructor(config: ActionConfig, platform: Platform = getPlatform()) {
    const { name, command, include, exclude, shell, timeout } = config;

    this.name = name ?? 'Unknown';
    switch (typeof command) {
      case 'string':
        this.template = command;
        break;
      case 'object': {
        const template: string | undefined =
          command[platform] || command.default;
        if (template !== undefined) {
          this.template = template;
          break;
        }
        throw new Error('Missing or invalid command option');
      }
      default:
        throw new Error('Missing or invalid command option');
    }
    this.include = createMatcher(include, true);
    this.exclude = createMatcher(exclude, false);
    this.shell = shell;
    this.timeout =
      typeof timeout === 'number' && timeout > 0 ? timeout : undefined;
  }

  /**
   * Evaluates if a given path matches the glob rules.
   *
   * @param file - The absolute file path to check.
   * @returns `true` if the file matches inclusion and is not excluded.
   */
  public matches(file: string): boolean {
    return this.include.matches(file) && !this.exclude.matches(file);
  }

  /**
   * Generates the command string with variables substituted.
   *
   * @param resource - The workspace file metadata variables.
   * @returns The substituted command line.
   */
  public getCommand(resource: Resource): string {
    return resource.substitute(this.template);
  }
}

/**
 * Resolves the current operating system platform.
 *
 * @returns The detected platform representation.
 */
export function getPlatform(): Platform {
  switch (process.platform) {
    case 'win32':
      return Platform.windows;
    case 'darwin':
      return Platform.macos;
    default:
      return Platform.linux;
  }
}
