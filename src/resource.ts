/**
 * Copyright (c) 2026 deep.rent GmbH (https://deep.rent).
 * Licensed under the MIT License.
 */

import * as path from 'node:path';

import * as vscode from 'vscode';

/**
 * Exposes path properties matching VS Code placeholder variables.
 */
export interface Variables {
  readonly workspaceFolder: string;
  readonly workspaceFolderBasename: string;
  readonly file: string;
  readonly relativeFile: string;
  readonly relativeFileDirname: string;
  readonly fileDirname: string;
  readonly fileBasename: string;
  readonly fileBasenameNoExtension: string;
  readonly fileExtname: string;
  readonly pathSeparator: string;
}

const VARIABLE_REGEX = /\$\{([^}]+)\}/g;

/**
 * Evaluates file metadata variables.
 */
export class Resource implements Variables {
  public readonly workspaceFolder: string;
  public readonly workspaceFolderBasename: string;
  public readonly file: string;
  public readonly relativeFile: string;
  public readonly relativeFileDirname: string;
  public readonly fileDirname: string;
  public readonly fileBasename: string;
  public readonly fileBasenameNoExtension: string;
  public readonly fileExtname: string;
  public readonly pathSeparator: string;

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
    this.relativeFileDirname = path.dirname(this.relativeFile);
    this.workspaceFolder = workspacePath || this.fileDirname;
    this.workspaceFolderBasename = workspacePath
      ? path.basename(workspacePath)
      : path.basename(this.fileDirname);
    this.pathSeparator = path.sep;
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
    if (!template.includes('${')) {
      return template;
    }

    return template.replace(VARIABLE_REGEX, (match: string, name: string) => {
      if (name.startsWith('env:')) {
        return process.env[name.slice(4)] ?? '';
      }
      const val = this[name as keyof Variables];
      return typeof val === 'string' ? val : match;
    });
  }
}
