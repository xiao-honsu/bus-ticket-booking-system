# Conventional Commit Messages - Best Practices

## Cấu trúc cơ bản

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

## Types phổ biến

- **feat**: Thêm tính năng mới
- **fix**: Sửa bug
- **docs**: Thay đổi documentation
- **style**: Thay đổi không ảnh hưởng code (format, dấu chấm phẩy, v.v.)
- **refactor**: Refactor code (không phải fix bug hay thêm feature)
- **perf**: Cải thiện performance
- **test**: Thêm hoặc sửa tests
- **build**: Thay đổi build system hoặc dependencies
- **ci**: Thay đổi CI configuration
- **chore**: Các thay đổi khác không ảnh hưởng src hoặc test files
- **revert**: Revert commit trước đó

## Quy tắc quan trọng

1. **Description**: Viết thường, ngắn gọn (≤50 ký tự), không dấu chấm cuối
2. **Body**: Tách khỏi description bằng 1 dòng trống, giải thích "what" và "why" (không phải "how")
3. **Footer**: Dùng cho breaking changes hoặc reference issues
4. **Breaking change**: Thêm `!` sau type/scope HOẶC viết `BREAKING CHANGE:` trong footer

## Ví dụ

```
feat: add user authentication

fix(api): resolve null pointer exception in user service

docs: update README with installation steps

feat!: remove deprecated payment API

BREAKING CHANGE: payment API v1 no longer supported
```

## Lợi ích

- Tự động sinh CHANGELOG
- Dễ tìm kiếm và filter commits
- Trigger semantic versioning
- Dễ onboard members mới
- Cấu trúc rõ ràng cho commit history
