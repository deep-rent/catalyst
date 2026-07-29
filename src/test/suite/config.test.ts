/**
 * Copyright (c) 2026 deep.rent GmbH (https://deep.rent).
 * Licensed under the MIT License.
 */

import * as assert from 'node:assert';

import { clearCache, getActions, getShowOutput } from '../../config';

describe('Config', () => {
  it('retrieves actions configuration', () => {
    const actions = getActions();
    assert.ok(Array.isArray(actions));
  });

  it('can clear the cache', () => {
    const actions1 = getActions();
    clearCache();
    const actions2 = getActions();
    assert.notStrictEqual(actions1, actions2);
  });

  it('retrieves default showOutput setting', () => {
    const mode = getShowOutput();
    assert.ok(mode === 'never' || mode === 'onError' || mode === 'always');
  });
});
