# Changelog

All notable changes to the extension will be documented in this file.

## [1.1.2] - 2026-07-29

### Changed

- Added new extension logo.

## [1.1.1] - 2026-07-29

### Fixed

- Stripped duplicate category prefix from command titles.

## [1.1.0] - 2026-07-29

### Added

- Added `timeout` configuration property to automatically terminate long-running processes when exceeded.
- Allow specifying custom working directories via the `cwd` option.
- Allow passing environment variables via the `env` option.
- Support adjusting the output channel visibility (`never`, `onError`, `always`).
- Integrated a status bar indicator to the display current activation state and enable one-click toggling.
- Contributed `toggle`, `run`, and `showOutput` shortcuts to the command palette.

### Changed

- Upgraded dependencies for internal housekeeping and build optimization.
- Enhanced action configuration validation error logs to include the specific action index, name, and validation failure reason.

### Fixed

- Fixed cross-platform root-relative path resolution for `cwd` on Windows environments.
- Buffer `stdout` and `stderr` streams to prevent fragmented output.
- Pinned deterministic VS Code test runner version to match minimum engine requirements.

## [1.0.7] - 2026-07-20

### Changed

- Upgraded dependencies for internal housekeeping and build optimization.

## [1.0.6] - 2026-06-28

### Changed

- Improved performance by delegating raw logging output directly to VS Code's `OutputChannel.append()` without extra formatting.

## [1.0.5] - 2026-06-28

### Changed

- Replaced `cp.exec` with streaming `cp.spawn` for real-time output logging.

## [1.0.4] - 2026-06-28

### Fixed

- Resolved issue where LFS attributes were applied to images, causing them to be downloaded as pointers.

## [1.0.3] - 2026-06-28

### Added

- Created a changelog file for tracking changes in the extension.

### Changed

- Upgraded dependencies for internal housekeeping and build optimization.

## [1.0.2] - 2026-06-28

### Changed

- Upgraded dependencies for internal housekeeping and build optimization.

## [1.0.1] - 2026-06-11

### Added

- Workflow for publishing to Open VSX Registry.

## [1.0.0] - 2026-06-11

### Added

- Initial release of the extension.
