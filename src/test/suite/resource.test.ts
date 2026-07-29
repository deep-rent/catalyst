/**
 * Copyright (c) 2026 deep.rent GmbH (https://deep.rent).
 * Licensed under the MIT License.
 */

import * as assert from 'node:assert';

import * as vscode from 'vscode';

import { Resource } from '../../resource';

describe('Resource', () => {
  it('initializes paths correctly without workspace', () => {
    const uri: vscode.Uri = vscode.Uri.file('/foo/bar/baz.ts');
    const resource: Resource = new Resource(uri);

    assert.strictEqual(resource.file, uri.fsPath);
    assert.strictEqual(resource.fileBasename, 'baz.ts');
    assert.strictEqual(resource.fileExtname, '.ts');
    assert.strictEqual(resource.fileBasenameNoExtension, 'baz');
    assert.strictEqual(resource.relativeFile, 'baz.ts');
    assert.strictEqual(resource.workspaceFolderBasename, 'bar');
  });

  it('substitutes templates correctly', () => {
    const uri: vscode.Uri = vscode.Uri.file('/foo/bar/baz.ts');
    const resource: Resource = new Resource(uri);

    const template: string =
      'echo ${fileBasenameNoExtension} in ${fileDirname}';
    const result: string = resource.substitute(template);

    assert.strictEqual(result, `echo baz in ${resource.fileDirname}`);
  });

  it('substitutes relativeFileDirname, pathSeparator, and env variables', () => {
    process.env['TEST-CATALYST-ENV.VAR'] = 'hello_world';
    const uri: vscode.Uri = vscode.Uri.file('/foo/bar/baz.ts');
    const resource: Resource = new Resource(uri);

    const template: string =
      'echo ${env:TEST-CATALYST-ENV.VAR} ${relativeFileDirname} ${pathSeparator}';
    const result: string = resource.substitute(template);

    assert.strictEqual(result, `echo hello_world . ${resource.pathSeparator}`);
    delete process.env['TEST-CATALYST-ENV.VAR'];
  });

  it('leaves unknown variables unchanged', () => {
    const uri: vscode.Uri = vscode.Uri.file('/baz.ts');
    const resource: Resource = new Resource(uri);

    const template: string = 'echo ${unknownVar}';
    const result: string = resource.substitute(template);

    assert.strictEqual(result, template);
  });
});
