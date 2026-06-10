import * as assert from 'node:assert';

import * as vscode from 'vscode';

import { run } from '../../runner';

describe('Runner', () => {
  it('ignores non-file inputs', async () => {
    const uri: vscode.Uri = vscode.Uri.parse('untitled:Untitled-1');
    await assert.doesNotReject(async () => {
      await run(uri);
    });
  });

  it('runs smoothly with file inputs when no actions match', async () => {
    const uri: vscode.Uri = vscode.Uri.file('/non-existent/file.txt');
    await assert.doesNotReject(async () => {
      await run(uri);
    });
  });
});
