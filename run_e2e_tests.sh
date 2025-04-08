#!/bin/bash

# Create test results directory
mkdir -p test-results

# Install Playwright dependencies if not already installed
if [ ! -d "frontend/node_modules/@playwright" ]; then
  echo "Installing Playwright dependencies..."
  cd frontend
  npm install -D @playwright/test
  npx playwright install
  cd ..
fi

# Run the E2E tests
cd frontend
npm run e2e

# Check if the tests passed
if [ $? -eq 0 ]; then
  echo "✅ E2E tests passed successfully!"
  exit 0
else
  echo "❌ E2E tests failed!"
  exit 1
fi 