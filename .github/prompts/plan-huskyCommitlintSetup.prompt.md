# Plan: Fix Husky + Commitlint Setup for Monorepo

## 📋 Problem Analysis

Dựa trên workspace của bạn, tôi thấy các vấn đề sau:

### Current Issues:
1. **Husky được setup ở `frontend`** thay vì **root** - Git hooks chỉ work ở nơi có `.git`
2. **Redundant configs** trong `frontend`:
   - `frontend/.husky/commit-msg` - `cd frontend && npx commitlint`
   - `frontend/.husky/pre-commit` - `cd frontend && npx lint-staged`
   - `frontend/commitlint.config.mjs`
   - `frontend/.lintstagedrc.mjs`
3. **Backend không có Husky hooks** - chỉ có ESLint/Prettier config
4. **Root không có `package.json`** với Husky setup

---

## 🎯 Implementation Plan

### Phase 1: Setup Root Package.json (5 mins)

**Files to Create:**

`package.json` (at root):
```json
{
  "name": "bus-ticket-booking",
  "private": true,
  "workspaces": [
    "frontend",
    "backend"
  ],
  "scripts": {
    "prepare": "husky",
    "install:all": "npm install && cd frontend && npm install && cd ../backend && npm install"
  },
  "devDependencies": {
    "@commitlint/cli": "^19.0.0",
    "@commitlint/config-conventional": "^19.0.0",
    "husky": "^9.1.7",
    "lint-staged": "^15.0.0"
  }
}
```

`commitlint.config.mjs` (at root):
```javascript
/** @type {import('@commitlint/types').UserConfig} */
const config = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'docs',
        'style',
        'refactor',
        'perf',
        'test',
        'chore',
        'revert',
        'build',
        'ci',
      ],
    ],
    'scope-enum': [
      1, // Warning level - allow flexibility
      'always',
      ['frontend', 'backend', 'root', 'deps', 'config', 'docs'],
    ],
    'scope-empty': [1, 'never'],
    'subject-case': [2, 'never', ['upper-case', 'pascal-case', 'start-case']],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'type-empty': [2, 'never'],
  },
};

export default config;
```

---

### Phase 2: Setup Husky Hooks at ROOT (5 mins)

**Files to Create:**

`.husky/commit-msg`:
```bash
npx --no -- commitlint --edit $1
```

`.husky/pre-commit`:
```bash
#!/usr/bin/env sh

# Lấy danh sách files đã staged
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM)

# Kiểm tra files thuộc frontend
FRONTEND_FILES=$(echo "$STAGED_FILES" | grep "^frontend/" || true)
if [ -n "$FRONTEND_FILES" ]; then
  echo "🔍 Linting frontend files..."
  cd frontend
  npx lint-staged
  FRONTEND_EXIT=$?
  cd ..
  if [ $FRONTEND_EXIT -ne 0 ]; then
    echo "❌ Frontend lint failed"
    exit 1
  fi
fi

# Kiểm tra files thuộc backend
BACKEND_FILES=$(echo "$STAGED_FILES" | grep "^backend/" || true)
if [ -n "$BACKEND_FILES" ]; then
  echo "🔍 Linting backend files..."
  cd backend
  npx lint-staged
  BACKEND_EXIT=$?
  cd ..
  if [ $BACKEND_EXIT -ne 0 ]; then
    echo "❌ Backend lint failed"
    exit 1
  fi
fi

echo "✅ All checks passed!"
```

---

### Phase 3: Clean Up Frontend (5 mins)

**Files to DELETE:**
- `frontend/.husky/` (entire folder)
- `frontend/commitlint.config.mjs`
- `frontend/.lintstagedrc.mjs` (redundant - already in package.json)

**Files to MODIFY:**

`frontend/package.json` - Update lint-staged config and remove husky-related items:

**Remove from frontend/package.json:**
- `"prepare": "husky"` script
- `"commitlint": "commitlint --edit"` script
- `@commitlint/cli` from devDependencies
- `@commitlint/config-conventional` from devDependencies
- `@commitlint/types` from devDependencies
- `husky` from devDependencies

**Ensure lint-staged config exists in frontend/package.json:**
```json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,css,scss,md}": [
      "prettier --write"
    ]
  }
}
```

---

### Phase 4: Add lint-staged to Backend (5 mins)

**Files to MODIFY:**

`backend/package.json` - Add lint-staged config:
```json
{
  "lint-staged": {
    "*.ts": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md}": [
      "prettier --write"
    ]
  }
}
```

**Add to backend devDependencies:**
```bash
cd backend && npm install -D lint-staged
```

---

### Phase 5: Verification Checklist

```bash
# 1. Install root dependencies
cd /path/to/project/root
npm install

# 2. Verify husky is initialized
ls -la .husky/

# 3. Test commitlint
git commit --allow-empty -m "test: verify commitlint setup"

# 4. Test pre-commit with frontend file
echo "// test" >> frontend/src/app/page.tsx
git add frontend/src/app/page.tsx
git commit -m "test(frontend): verify pre-commit hook"

# 5. Test pre-commit with backend file
echo "// test" >> backend/src/app.ts
git add backend/src/app.ts
git commit -m "test(backend): verify pre-commit hook"

# 6. Clean up test commits
git reset --soft HEAD~3
git checkout -- .
```

---

## 📁 Final Structure

```
project-root/
├── .git/
├── .husky/                    # ✅ Husky at ROOT
│   ├── commit-msg
│   └── pre-commit
├── package.json               # ✅ Root package.json with husky
├── commitlint.config.mjs      # ✅ Root commitlint config
├── frontend/
│   ├── package.json           # ✅ lint-staged config only
│   ├── eslint.config.mjs
│   ├── prettier.config.mjs
│   └── (NO .husky/, NO commitlint.config.mjs)
├── backend/
│   ├── package.json           # ✅ lint-staged config added
│   ├── .eslintrc.json
│   └── .prettierrc.json
└── README.md
```

---

## ⏱️ Time Estimate

| Phase | Task | Time |
|-------|------|------|
| 1 | Create root `package.json` + commitlint | 5 mins |
| 2 | Setup .husky/ hooks at root | 5 mins |
| 3 | Clean up frontend configs | 5 mins |
| 4 | Add lint-staged to backend | 5 mins |
| 5 | Verification | 5 mins |
| **Total** | | **25 mins** |

---

## 🚀 Ready to Implement?

Reply with "go" or specify which phase to start with.
