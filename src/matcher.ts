/**
 * Copyright (c) 2026 deep.rent GmbH (https://deep.rent).
 * Licensed under the MIT License.
 */

import { Minimatch } from 'minimatch';

/**
 * Defines a strategy for checking if a file path meets specific rules.
 */
export interface Matcher {
  /**
   * Evaluates whether the specified file path satisfies match conditions.
   *
   * @param file - The absolute file path to check.
   * @returns `true` if the file satisfies the conditions, otherwise `false`.
   */
  matches(file: string): boolean;
}

/**
 * Matches file paths using glob patterns powered by minimatch.
 */
class GlobMatcher implements Matcher {
  private readonly patterns: Minimatch[];

  /**
   * Initializes a new instance with the provided glob patterns.
   *
   * @param patterns - A list of glob patterns to match against.
   */
  constructor(patterns: string[]) {
    this.patterns = patterns.map(
      (pattern: string) =>
        new Minimatch(pattern, { matchBase: true, dot: true }),
    );
  }

  public matches(file: string): boolean {
    return this.patterns.some((pattern: Minimatch) => pattern.match(file));
  }
}

/**
 * Factory function for creating a matcher instance from the specified patterns.
 *
 * @param patterns - Optional array of glob patterns.
 * @param fallback - The default boolean match result if patterns are empty.
 * @returns A configured matcher instance.
 */
export const createMatcher = (
  patterns?: string[] | undefined,
  fallback = false,
): Matcher => {
  return patterns !== undefined && patterns.length !== 0
    ? new GlobMatcher(patterns)
    : { matches: () => fallback };
};
