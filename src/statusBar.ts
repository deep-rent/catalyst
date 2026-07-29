/**
 * Copyright (c) 2026 deep.rent GmbH (https://deep.rent).
 * Licensed under the MIT License.
 */

import * as vscode from 'vscode';

/**
 * Manages the extension status bar item and global enabled/disabled state.
 */
export class StatusBarManager {
  private readonly item: vscode.StatusBarItem;
  private enabled = true;

  /**
   * Initializes the status bar manager and registers the item in extension subscriptions.
   *
   * @param context - The ExtensionContext container to bind lifecycle disposables.
   */
  constructor(context: vscode.ExtensionContext) {
    this.item = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Right,
      100,
    );
    this.item.command = 'catalyst.toggle';
    this.update();
    this.item.show();
    context.subscriptions.push(this.item);
  }

  /**
   * Indicates whether run-on-save actions are currently enabled.
   *
   * @returns `true` if enabled, otherwise `false`.
   */
  public isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Toggles the enabled state and updates the status bar display.
   *
   * @returns The new boolean state.
   */
  public toggle(): boolean {
    this.enabled = !this.enabled;
    this.update();
    return this.enabled;
  }

  /**
   * Sets the enabled state explicitly.
   *
   * @param value - The desired state.
   */
  public setEnabled(value: boolean): void {
    this.enabled = value;
    this.update();
  }

  private update(): void {
    if (this.enabled) {
      this.item.text = '$(play) Catalyst: Active';
      this.item.tooltip = 'Catalyst: Run on Save is active. Click to disable.';
    } else {
      this.item.text = '$(circle-slash) Catalyst: Disabled';
      this.item.tooltip = 'Catalyst: Run on Save is disabled. Click to enable.';
    }
  }
}
