# TodoMVC built with Svelte and Store

[![Build Status](https://travis-ci.com/blacksonic/todomvc-svelte.svg?branch=master)](https://travis-ci.com/blacksonic/todomvc-svelte)
[![Dependencies Status](https://david-dm.org/blacksonic/todomvc-svelte/status.svg)](https://david-dm.org/blacksonic/todomvc-svelte)

The well-known TodoMVC built with Svelte and Store in a structured and testable way.

![TodoMVC Svelte](./images/screenshot.png "TodoMVC Svelte")

## Concepts and tools covered

- [Components and Props](https://svelte.dev/tutorial/declaring-props)
- [Handling Events](https://svelte.dev/tutorial/component-events)
- [Store](https://svelte.dev/tutorial/writable-stores)
- [Unit Testing](https://github.com/testing-library/svelte-testing-library)
- [E2E Testing](https://www.cypress.io/)

## Usage

After installing the dependencies the following NPM scripts become available:

- `start`: starts the application in development mode on [http://localhost:9500](http://localhost:9500)
- `build`: bundles the application for production into the `public` folder
- `test`: runs unit and E2E tests
- `test:unit`: runs unit tests with [Jest](https://jestjs.io/) in the `src` folder suffixed with `*.spec.js`
- `test:e2e`: runs E2E tests with [Cypress](https://www.cypress.io/) in the `tests/e2e` folder suffixed with `*.spec.js`
- `format`: formats the code with [Prettier](https://prettier.io/) within the `src` folder
- `lint`: lint files with [ESLint](https://eslint.org/) based on [Airbnb's styleguide](https://github.com/airbnb/javascript) and the Prettier config

## Component architecture

![Architecture](./images/architecture.png)

Application is compatible with [Svelte devtools](https://chrome.google.com/webstore/detail/svelte-devtools/ckolcbmkjpjmangdbmnkpjigpkddpogn)

## Series

This implementation is part of a series where the same application was implemented with the same architecture.

- [Vue](https://github.com/blacksonic/todomvc-vue)
- [Vue Composition API](https://github.com/blacksonic/todomvc-vue-composition-api)
- [Angular](https://github.com/blacksonic/todomvc-angular)
- [React](https://github.com/blacksonic/todomvc-react)
- [React Hooks](https://github.com/blacksonic/todomvc-react-hooks)
- [Svelte](https://github.com/blacksonic/todomvc-svelte)
