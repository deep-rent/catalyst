# Catalyst

Run commands automatically on file save in Visual Studio Code.

Catalyst enables you to automate development workflows by executing shell commands instantly whenever specific files are saved. Whether you need to run formatters, linters, code-generators, tests, or build tasks, Catalyst handles it seamlessly in the background.

## Examples

### 1. Code Formatting with Prettier

Automatically format TypeScript, JavaScript, and JSON files on save:

```json
{
  "catalyst.actions": [
    {
      "name": "Prettier Format",
      "command": "npx prettier --write \"${file}\"",
      "include": ["**/*.ts", "**/*.js", "**/*.json"],
      "exclude": ["**/node_modules/**"]
    }
  ]
}
```

### 2. Platform-Specific Action (e.g. Code Formatting with Gradle Spotless)

Run different Gradle scripts based on the active operating system to format the saved file:

```json
{
  "catalyst.actions": [
    {
      "name": "Spotless Format (Gradle)",
      "command": {
        "windows": "${workspaceFolder}\\gradlew.bat spotlessApply -PspotlessFiles=\"${file}\"",
        "default": "${workspaceFolder}/gradlew spotlessApply -PspotlessFiles=\"${file}\""
      },
      "include": ["**/*.java", "**/*.kt"],
      "exclude": ["**/build/**"]
    }
  ]
}
```

### 3. Build & Test on Save

Automatically compile and run tests in a Go project when code changes:

```json
{
  "catalyst.actions": [
    {
      "name": "Build & Test Go Project",
      "command": "go build ./... && go test ./...",
      "include": ["**/*.go"],
      "exclude": ["**/vendor/**"]
    }
  ]
}
```

## Configuration

Configure the extension inside your VS Code `settings.json` file.

### Settings

| Setting                    | Type      | Default | Description                                                        |
| :------------------------- | :-------- | :------ | :----------------------------------------------------------------- |
| `catalyst.actions`         | `array`   | `[]`    | List of actions to execute on file save.                           |
| `catalyst.showErrorPopups` | `boolean` | `true`  | Show notification popups if an action command exits with an error. |

### Action Properties

Each action object in `catalyst.actions` supports the following properties:

| Property  | Type                 | Required | Description                                                                                                                       |
| :-------- | :------------------- | :------- | :-------------------------------------------------------------------------------------------------------------------------------- |
| `command` | `string` or `object` | **Yes**  | The shell command to run. To use platform-specific commands, pass an object with keys: `windows`, `macos`, `linux`, or `default`. |
| `name`    | `string`             | No       | A descriptive label for the action (used in logs and error notifications).                                                        |
| `include` | `string[]`           | No       | Glob patterns indicating which files trigger the action. Matches all files if omitted.                                            |
| `exclude` | `string[]`           | No       | Glob patterns to prevent matching files from triggering the action.                                                               |
| `shell`   | `string`             | No       | Absolute path to a custom shell executable (e.g. `/bin/zsh`, `powershell.exe`).                                                   |

> [!NOTE]
> Globs are evaluated relative to your workspace root directory. They support both standard file extension patterns (e.g. `**/*.ts`) and directory-specific exclusions.

## Variable Substitution

You can embed the following placeholders in your command strings:

| Variable                     | Description                                  | Example Output                              |
| :--------------------------- | :------------------------------------------- | :------------------------------------------ |
| `${workspaceFolder}`         | Absolute path of the active workspace folder | `/Users/tarik/projects/my-app`              |
| `${workspaceFolderBasename}` | The folder name of the workspace root        | `my-app`                                    |
| `${file}`                    | Absolute path of the saved file              | `/Users/tarik/projects/my-app/src/index.ts` |
| `${relativeFile}`            | Workspace-relative path of the saved file    | `src/index.ts`                              |
| `${fileBasename}`            | Filename including extension                 | `index.ts`                                  |
| `${fileBasenameNoExtension}` | Filename excluding extension                 | `index`                                     |
| `${fileExtname}`             | File extension                               | `.ts`                                       |
| `${fileDirname}`             | Absolute path of the saved file's directory  | `/Users/tarik/projects/my-app/src`          |

## Troubleshooting

### Silent Failures

**Problem:** Commands are not running or are failing silently, making it difficult to debug the issue.

**Solution:** Check the extension logs in VS Code:

1. Open the **Output** panel in VS Code (`View` > `Output` or `Cmd+Shift+U`/`Ctrl+Shift+U`).
2. Select **Catalyst** from the dropdown menu in the top-right corner.
3. Review the execution logs to inspect target file matches, resolved command strings, and shell exit codes.

### Spaces in File Paths

**Problem:** If your file paths contain spaces or special characters, commands might fail or parse incorrectly.

**Solution:** Always wrap `${file}` and other path variables in double quotes within your command template, for example: `npx prettier --write "${file}"`.

### Command Not Found or Missing PATH Variables

**Problem:** VS Code commands run in a non-interactive shell environment that might not load all of your user profile configurations (like custom alias settings or dynamic `PATH` expansions from `.bashrc` or `.zshrc`), causing commands to fail because they cannot be found.

**Solution:**

- Use absolute paths for commands (e.g., `/usr/local/bin/node` instead of just `node`) if they cannot be found.
- Specify a custom shell executable using the `shell` option (e.g., `/bin/zsh` or `powershell.exe`) if you need a specific shell context.

### Performance & High CPU Usage

**Problem:** Running heavy build or compile commands on every save can slow down your workspace and consume high CPU resources.

**Solution:** Use the `exclude` property to ignore files in temporary directories (e.g., `**/tmp/**`), build folders (e.g., `**/dist/**`, `**/build/**`), or dependency folders (e.g., `**/node_modules/**`).
