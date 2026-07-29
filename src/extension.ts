/**
 * Copyright (c) 2026 deep.rent GmbH (https://deep.rent).
 * Licensed under the MIT License.
 */

import * as vscode from 'vscode';

import { clearCache } from './config';
import { EXTENSION_NAME } from './constants';
import { Level, logger } from './logger';
import { run } from './runner';
import { StatusBarManager } from './status-bar';

/**
 * Hooks up workspace listeners for save events, configuration modifications,
 * and registers commands.
 *
 * @param context - The context container for this extension.
 */
export function activate(context: vscode.ExtensionContext): void {
  logger.init(context);
  logger.send(Level.info, `${logger.name} extension activated.`);

  const statusBarManager = new StatusBarManager(context);

  context.subscriptions.push(
    vscode.workspace.onDidSaveTextDocument(
      async (document: vscode.TextDocument) => {
        if (!statusBarManager.isEnabled()) {
          return;
        }
        await run(document.uri);
      },
    ),

    vscode.workspace.onDidChangeConfiguration(
      (e: vscode.ConfigurationChangeEvent) => {
        if (e.affectsConfiguration(EXTENSION_NAME)) {
          clearCache();
        }
      },
    ),

    vscode.commands.registerCommand('catalyst.toggle', () => {
      const status = statusBarManager.toggle() ? 'enabled' : 'disabled';
      logger.send(Level.info, `Catalyst globally ${status}.`);
      vscode.window.setStatusBarMessage(
        `Catalyst: Run on Save ${status}`,
        2000,
      );
    }),

    vscode.commands.registerCommand('catalyst.run', async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showWarningMessage('Catalyst: No active editor found.');
        return;
      }
      logger.send(
        Level.info,
        `Manually triggering actions for file: ${editor.document.uri.fsPath}`,
      );
      await run(editor.document.uri);
    }),

    vscode.commands.registerCommand('catalyst.showOutput', () => {
      logger.show();
    }),
  );
}

/**
 * Performs extension deactivation cleanup tasks.
 */
export function deactivate(): void {}
