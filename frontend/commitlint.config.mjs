/** @type {import('@commitlint/types').UserConfig} */
const config = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2, // Error level, 1 for warning level
      'always',
      [
        'feat', // Tính năng mới
        'fix', // Sửa bug
        'docs', // Thay đổi documentation
        'style', // Format code (không ảnh hưởng logic)
        'refactor', // Refactor code
        'perf', // Cải thiện performance
        'test', // Thêm/sửa tests
        'chore', // Thay đổi build process, tools
        'revert', // Revert commit trước
        'build', // Thay đổi build system
        'ci', // Thay đổi CI/CD
      ],
    ],
    'subject-case': [2, 'never', ['upper-case', 'pascal-case', 'start-case']],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'type-empty': [2, 'never'],
    'scope-case': [2, 'always', 'lower-case'],
  },
};

export default config;
