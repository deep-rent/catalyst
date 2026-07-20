# Changelog

All notable changes to the extension will be documented in this file.

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
