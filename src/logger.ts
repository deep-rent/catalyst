import * as util from 'util';
import * as vscode from 'vscode';

/**
 * Specifies the severity level of a log message.
 */
export enum Level {
  info = 'INFO',
  error = 'ERROR',
}

/**
 * Directs log output to a {@link vscode.OutputChannel}.
 */
export class Logger {
  private channel: vscode.OutputChannel | null = null;

  /**
   * Initializes a logger with the given display name.
   *
   * @param name - The name of the target output channel.
   */
  constructor(public readonly name: string) {}

  /**
   * Binds the output channel to the extension lifecycle.
   *
   * @param context - The context container for this extension.
   */
  public init(context: vscode.ExtensionContext): void {
    this.channel = vscode.window.createOutputChannel(this.name);
    context.subscriptions.push(this.channel);
  }

  /**
   * Appends a structured log entry to the underlying channel output.
   *
   * @param level - Indicates the severity of the entry.
   * @param message - The main log description text.
   * @param error - Optional context data or error details to format.
   */
  public send(level: Level, message: string, error?: unknown): void {
    if (this.channel === null) {
      return;
    }
    const timestamp = new Date().toLocaleTimeString();
    this.channel.appendLine(`[${level}] ${timestamp} - ${message}`);
    if (error !== undefined) {
      this.channel.appendLine(
        typeof error === 'string'
          ? error
          : util.inspect(error, { depth: null }),
      );
    }
  }

  /**
   * Reveals the output panel in the editor user interface.
   */
  public show(): void {
    if (this.channel === null) {
      return;
    }
    this.channel.show();
  }
}

/**
 * Shared logger singleton instance for the extension.
 */
export const logger = new Logger('Catalyst');
