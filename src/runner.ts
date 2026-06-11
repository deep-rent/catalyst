/**
 * Copyright (c) 2026 deep.rent GmbH (https://deep.rent).
 * Licensed under the MIT License.
 */

import type * as vscode from 'vscode';

import type { Action } from './action';
import { Command } from './command';
import { getActions } from './config';
import type { Executor } from './executor';
import { createExecutor } from './executor';
import { Resource } from './resource';

const executor: Executor = createExecutor();

/**
 * Triggers configured task commands associated with a saved file.
 *
 * Loops through parsed actions and runs commands matching the saved file path.
 *
 * @param uri - The URI pointing to the saved file.
 * @returns A promise that resolves when all matching tasks finish executing.
 */
export async function run(uri: vscode.Uri): Promise<void> {
  if (uri.scheme !== 'file') {
    return;
  }

  const actions: Action[] = getActions();

  if (actions.length === 0) {
    return;
  }

  let resource: Resource | undefined;

  for (const action of actions) {
    if (!action.matches(uri.fsPath)) {
      continue;
    }

    if (resource === undefined) {
      resource = new Resource(uri);
    }

    await executor.execute(Command.create(action, resource));
  }
}
