/**
 * Copyright (c) 2026 deep.rent GmbH (https://deep.rent).
 * Licensed under the MIT License.
 */

import * as vscode from 'vscode';

import { Action } from './action';
import { EXTENSION_NAME } from './constants';
import { Level, logger } from './logger';

/**
 * Lists the supported host operating system platforms.
 *
 * These values are used to distinguish platform-specific commands in the
 * extension's configuration.
 */
export enum Platform {
  windows = 'windows',
  macos = 'macos',
  linux = 'linux',
}

/**
 * Specifies the settings required to instantiate an {@link Action}.
 */
export interface ActionConfig {
  readonly name?: string | undefined;
  readonly command:
    | string
    | ({
        [key in Platform]?: string | undefined;
      } & {
        default?: string | undefined;
      });
  readonly include?: string[] | undefined;
  readonly exclude?: string[] | undefined;
  readonly shell?: string | undefined;
  readonly timeout?: number | undefined;
}

let cache: Action[] | undefined;

/**
 * Resolves configuration settings to return validated action objects.
 *
 * Parses workspace configuration, skips invalid configurations, and assembles
 * an array of action instances. Results remain cached until reset with
 * {@link clearCache}.
 *
 * @returns An array of configured action definitions.
 */
export function getActions(): Action[] {
  if (cache !== undefined) {
    return cache;
  }

  const configs = vscode.workspace
    .getConfiguration(EXTENSION_NAME)
    .get<ActionConfig[]>('actions');

  if (!Array.isArray(configs)) {
    logger.send(
      Level.error,
      `Configuration '${EXTENSION_NAME}.actions' is not an array.`,
    );
    return [];
  }

  cache = [];
  for (const config of configs) {
    try {
      cache.push(new Action(config));
    } catch (error: unknown) {
      logger.send(Level.error, 'Invalid action configuration ignored:', error);
    }
  }

  return cache;
}

/**
 * Resets the cached actions so they are parsed again on the next file save.
 */
export function clearCache(): void {
  cache = undefined;
}
