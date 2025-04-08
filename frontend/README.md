# Frontend

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.2.4.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

The project uses Playwright for end-to-end testing. To run the tests:

### First-time setup

```bash
# Install Playwright dependencies
npm install -D @playwright/test
npx playwright install
```

### Running the tests

```bash
# Run all tests in headless mode (suitable for CI/CD)
npm run e2e

# Run tests with UI for debugging
npm run e2e:ui

# Run tests with debugging
npm run e2e:debug

# Run a specific test file
npx playwright test basic.spec.ts
```

### Test categories

The test suite includes:
- Basic UI and navigation tests
- Form validation tests
- API integration tests
- Error handling and edge cases
- Component preview testing

### Viewing test reports

After running the tests, you can view the HTML report:

```bash
npx playwright show-report
```

Test artifacts (including screenshots) are saved in the `test-results` directory.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

For Playwright testing documentation, visit the [Playwright documentation](https://playwright.dev/docs/intro).
