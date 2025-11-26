# Quick Start: Running Tests

## Prerequisites

Ensure you have the following installed:
- Node.js 18+
- npm or yarn

## Step 1: Install Dependencies

```bash
cd Source/backend
npm install
```

## Step 2: Install Test Dependency

The project requires `mongodb-memory-server` for in-memory database testing:

```bash
npm install --save-dev mongodb-memory-server
```

## Step 3: Run Tests

### Run All Tests
```bash
npm test
```

**Expected Output:**
```
Test Suites: 6 passed, 6 total
Tests:       74 passed, 74 total
Snapshots:   0 total
Time:        ~25-30 seconds
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

This will run tests automatically when you change files. Great for development!

### Generate Coverage Report
```bash
npm run coverage
```

**Expected Output:**
```
Coverage summary:
Statements   : > 70%
Branches     : > 60%
Functions    : > 70%
Lines        : > 70%
```

**View HTML Report:**
- Open: `coverage/lcov-report/index.html` in your browser

## Step 4: Verify Results

### Successful Test Run Should Show:
- ✅ All 74 tests passing
- ✅ No errors or warnings
- ✅ Coverage > 70% overall
- ✅ Coverage > 80% for services

### Test Breakdown:
- **Unit Tests:** 29 tests
  - Auth Service: 8 tests
  - Booking Service: 9 tests
  - SeatLock Service: 12 tests

- **Integration Tests:** 45 tests
  - Auth API: 14 tests
  - Booking API: 16 tests
  - SeatLock API: 15 tests

## Troubleshooting

### Issue: MongoDB Memory Server Download
If `mongodb-memory-server` takes long to download:

```bash
# Set download directory
export MONGOMS_DOWNLOAD_DIR=~/.cache/mongodb-memory-server/mongodb-binaries
```

### Issue: Tests Timeout
If tests timeout (> 30 seconds), increase timeout in `jest.config.js`:

```javascript
module.exports = {
  // ...
  testTimeout: 60000, // Increase to 60 seconds
};
```

### Issue: Port Already in Use
The tests use in-memory database, so no port conflicts. But if you see errors:

```bash
# Kill any running MongoDB processes
killall mongod  # Linux/Mac
taskkill /F /IM mongod.exe  # Windows
```

### Issue: Test Database Not Cleaned
Tests automatically clean the database. But if you see issues:

```bash
# Delete test data manually
rm -rf ~/.cache/mongodb-memory-server
```

## Running Specific Tests

### Run Specific Test File
```bash
npm test -- auth.service.test
```

### Run Tests Matching Pattern
```bash
npm test -- --testNamePattern="should login"
```

### Run With Verbose Output
```bash
npm test -- --verbose
```

## CI/CD Integration

### GitHub Actions
```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm test
      - run: npm run coverage
```

### GitLab CI
```yaml
test:
  image: node:18
  script:
    - npm install
    - npm test
    - npm run coverage
  coverage: '/All files[^|]*\|[^|]*\s+([\d\.]+)/'
```

## Next Steps

After successful test run:
1. ✅ Review coverage report
2. ✅ Check for any warnings
3. ✅ Run tests before committing code
4. ✅ Add more tests as needed

## Documentation

For more details:
- **Complete Guide:** [`TESTING_DOCUMENTATION.md`](./TESTING_DOCUMENTATION.md)
- **Implementation Summary:** [`TASK_3.4_SUMMARY.md`](./TASK_3.4_SUMMARY.md)
- **Phase 3 Prompt:** [`.github/prompts/phase3-polish-testing.prompt.md`](../.github/prompts/phase3-polish-testing.prompt.md)

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review test output carefully
3. Check `TESTING_DOCUMENTATION.md` for detailed information
4. Ensure all dependencies are installed

---

**Quick Commands Summary:**
```bash
npm install                              # Install dependencies
npm install --save-dev mongodb-memory-server  # Install test DB
npm test                                 # Run all tests
npm run test:watch                       # Watch mode
npm run coverage                         # Generate coverage
```

**Status Check:**
- ✅ 74 tests should pass
- ✅ Coverage > 70%
- ✅ No errors or failures
- ✅ Execution time < 30 seconds

---

**Last Updated:** November 26, 2025  
**Version:** 1.0.0  
**Total Tests:** 74
