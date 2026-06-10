import * as vscode from 'vscode';

import { clearCache } from './config';
import { EXTENSION_NAME } from './constants';
import { Level, logger } from './logger';
import { run } from './runner';

/**
 * Hooks up workspace listeners for save events and configuration modifications.
 *
 * @param context - The context container for this extension.
 */
export function activate(context: vscode.ExtensionContext): void {
  logger.init(context);
  logger.send(Level.info, `${logger.name} extension activated.`);

  context.subscriptions.push(
    vscode.workspace.onDidSaveTextDocument(
      async (document: vscode.TextDocument) => {
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
  );
}

/**
 * Performs extension deactivation cleanup tasks.
 */
export function deactivate(): void {}
