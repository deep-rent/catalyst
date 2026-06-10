import * as path from 'path';
import * as vscode from 'vscode';

/**
 * Exposes path properties matching VS Code placeholder variables.
 */
export interface Variables {
  readonly workspaceFolder: string;
  readonly workspaceFolderBasename: string;
  readonly file: string;
  readonly relativeFile: string;
  readonly fileDirname: string;
  readonly fileBasename: string;
  readonly fileBasenameNoExtension: string;
  readonly fileExtname: string;
}

/**
 * Evaluates file metadata variables.
 */
export class Resource implements Variables {
  public readonly workspaceFolder: string;
  public readonly workspaceFolderBasename: string;
  public readonly file: string;
  public readonly relativeFile: string;
  public readonly fileDirname: string;
  public readonly fileBasename: string;
  public readonly fileBasenameNoExtension: string;
  public readonly fileExtname: string;

  /**
   * Evaluates and populates path properties for the target file.
   *
   * @param uri - The URI locating the saved file.
   */
  constructor(public readonly uri: vscode.Uri) {
    this.file = uri.fsPath;
    const workspaceFolder: vscode.WorkspaceFolder | undefined =
      vscode.workspace.getWorkspaceFolder(uri);
    this.fileDirname = path.dirname(this.file);
    this.fileBasename = path.basename(this.file);
    this.fileExtname = path.extname(this.file);
    this.fileBasenameNoExtension = path.basename(this.file, this.fileExtname);
    const workspacePath: string | undefined = workspaceFolder?.uri.fsPath;
    this.relativeFile = workspacePath
      ? path.relative(workspacePath, this.file)
      : this.fileBasename;
    this.workspaceFolder = workspacePath || this.fileDirname;
    this.workspaceFolderBasename = workspacePath
      ? path.basename(workspacePath)
      : path.basename(this.fileDirname);
  }

  /**
   * Replaces placeholders in a template with actual path property values.
   *
   * Example: `echo ${fileBasename}` to `echo index.js`
   *
   * @param template - The string containing variables to substitute.
   * @returns The interpolated command string.
   */
  public substitute(template: string): string {
    return template.replace(
      /\$\{(workspaceFolder|workspaceFolderBasename|file|relativeFile|fileDirname|fileBasename|fileBasenameNoExtension|fileExtname)\}/g,
      (match: string, name: string) => this[name as keyof Variables] ?? match,
    );
  }
}
