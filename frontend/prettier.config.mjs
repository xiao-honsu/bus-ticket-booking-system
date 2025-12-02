/**
 * @file Prettier Configuration
 * @description Code formatting rules for the project
 * @see https://prettier.io/docs/en/configuration.html
 */

/**
 * Prettier configuration object
 * @type {import('prettier').Config}
 */
const config = {
  /**
   * Print semicolons at the ends of statements
   * @default true
   */
  semi: true,

  /**
   * Print trailing commas wherever possible in multi-line comma-separated syntactic structures
   * @default 'es5' - Trailing commas where valid in ES5 (objects, arrays, etc.)
   */
  trailingComma: 'es5',

  /**
   * Use single quotes instead of double quotes
   * @default true
   */
  singleQuote: true,

  /**
   * Specify the line length that the printer will wrap on
   * @default 120
   */
  printWidth: 120,

  /**
   * Specify the number of spaces per indentation-level
   * @default 2
   */
  tabWidth: 2,

  /**
   * Line ending style
   * @default 'lf' - Line Feed only (\n), common on Linux and macOS
   */
  endOfLine: 'lf',
};

export default config;
