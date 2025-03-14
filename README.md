# RBT (Rose, Bud, Thorn) App

## Information

### Accessing

Our site is hosted on Azure and is available for you to access here: https://lemon-bush-09e7af61e.6.azurestaticapps.net

### Our Team

- **Class:** CSC-309, Software Engineering II

- **Team:** Scrubbles

- **Members:** Ashley, Brady, Giselle, Parker, Xio

### About

A mobile-first progressive web application for creating, saving, and sharing Rose, Bud, Thorn reflections.

<img src="react-frontend/public/RBDLogoRounded.png" width="35%" />

#### Pages

- Home: See all your past entries, centered around a calendar view
- Search: Look up past entries and organize them by tag
- New Entry: Submit your entry for the today or edit it if things change
- Groups: Join or create a group to share your entries with others
- Settings: Manage your account and groups

### Full Documentation

Product specification available at:
https://docs.google.com/document/d/1Q9Pb7pFX5MPUqU08wkb596TnNUbwz5IgTGI1K2bUjIk/edit?usp=sharing

## Development

### Getting Started

Our project utilizes a mono-repo strategy with separate directories for front and backend.

1. Clone the repository
2. Create `.env` file in `express-backend` folder with:

    ```
    MONGODB_URI=mongodb+srv://XXXXX:XXXXX@cluster0.q1r5h.mongodb.net/rbt_users_data
    JWT_SECRET=XXXXX
    ```

3. Install all dependencies (both frontend and backend):
    ```bash
    npm install
    ```
4. Start both servers:
    ```bash
    npm start
    ```
In development it is important to enable the following settings:
- Autoformat on save and focus change in VSCode
- Formatter: Prettier
  
These settings will ensure all code is in the same format.
Also, before pushing change, it is important to run "npm run lint" and "npm run build" and fix any linting errors.

### Testing

To run the test suite:

```bash
npm test
```

#### Database Operations

Latest Model test coverage report (December 4, 2023, 05:54:38):

```
File             | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
-----------------|---------|----------|---------|---------|-------------------
All files        |    100  |    100   |   100   |   100   |
 group-services.js|    100  |    100   |   100   |   100   |
 groups.js       |    100  |    100   |   100   |   100   |
 user-services.js|    100  |    100   |   100   |   100   |
 user.js         |    100  |    100   |   100   |   100   |
-----------------|---------|----------|---------|---------|-------------------
```

#### Mock-Based Tests

[To be filled in: other tests]

#### Cypress E2E Testing

To set up Cypress E2E testing, insert the environment keys into cypress.config.js (with the proper env values)

```js
const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    testIsolation: false,
    env: {
    "api_url": "XXXXXXXX",
    "password": "XXXXXXXX"
    }
  },
});

```


To run Cypress E2E testing, type
```bash
npx cypress open
```


### Tech Stack

#### Core Technologies

- Frontend: React.js
- Backend: Node.js/Express.js
- Database: MongoDB
- Authentication: JWT

#### Development Tools

- Concurrently
- Nodemon

#### Code Quality

- ESLint
- Prettier with config file

#### Continuous Integration

Our CI pipeline uses GitHub Actions to ensure code quality and automated testing:

- Runs automated testing on every push to main and pull requests
- Sets up Node.js environment and installs dependencies
- Verifies code quality through linting
- Runs backend tests with MongoDB test database
- Ensures frontend builds successfully

#### Deployment

Our application is deployed using Azure services:

**Frontend**

Avaliable at: https://lemon-bush-09e7af61e.6.azurestaticapps.net
- Deployed to Azure Static Web Apps
- Triggered on push to main branch
- Configures environment variables for backend API connection
- Handles monorepo structure with proper build settings

**Backend**

Avaliable at: https://rbt-backend.azurewebsites.net
- Deployed to Azure App Service
- Packages and uploads backend code as a zip artifact
- Sets up database connection and environment variables
- Runs as a Node.js web service with Express
