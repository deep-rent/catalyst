import * as assert from 'node:assert';

import type { Matcher } from '../../matcher';
import { createMatcher } from '../../matcher';

describe('Matcher', () => {
  describe('createMatcher', () => {
    it('returns a fallback matcher when patterns are undefined (true)', () => {
      const matcher: Matcher = createMatcher(undefined, true);
      assert.strictEqual(matcher.matches('/test/file.ts'), true);
    });

    it('returns a fallback matcher when patterns are undefined (false)', () => {
      const matcher: Matcher = createMatcher(undefined, false);
      assert.strictEqual(matcher.matches('/test/file.ts'), false);
    });

    it('returns a fallback matcher when patterns are empty', () => {
      const matcher: Matcher = createMatcher([], true);
      assert.strictEqual(matcher.matches('/test/file.ts'), true);
    });

    it('returns a GlobMatcher that evaluates paths correctly', () => {
      const matcher: Matcher = createMatcher(['**/*.ts', '*.js']);
      assert.strictEqual(matcher.matches('/src/index.ts'), true);
      assert.strictEqual(matcher.matches('index.js'), true);
      assert.strictEqual(matcher.matches('/src/index.md'), false);
    });
  });
});
