# NestJS Backend Setup

This project is a NestJS backend application configured with Swagger for API documentation. Below are the steps and commands to set up, run, test, and build the application.


## Prerequisites

- Node.js (v14.x or higher)
- npm (v6.x or higher) or Yarn (v1.x or higher)
- Nest CLI (optional but recommended)


## Installation

Install the dependencies by running:

```bash
 npm install

```

## Database Configuration

The database for the application can be configured using properties in the db.config.ts. 

- go to path "src/database/config/db.config.ts"

- change the properties values with your connection params. 

```
export const dbConfig = {

  host: '',
  port: 3306,
  username: '',
  password: '',
  database: '',
};
```


## Running the Application

**Development Mode**

To run the application in development mode:

```bash
 npm run start

```
**Watch Mode**

To run the application in watch mode (automatically restarts on code changes):

```bash
 npm run start:dev

```
**Production Mode**

To run the application in production mode:

```bash
 npm run start:dev

```


## Swagger UI

Swagger is set up for API documentation. To access the Swagger UI, paste the following URL into your browser:

http://localhost:3001/api


## Testing the Application

**Unit Tests**

To run the unit tests:

```bash
 npm run test

```

**End-to-End (e2e) Tests**

To run the e2e tests:

```bash
 npm run test:e2e

```

**Test Coverage**

To generate the test coverage report:

```bash
 npm run test:cov

```

## Building the Application

To build the application for production:

```bash
 npm run build

```

## Common NestJS Commands

**Generating a Module**

To generate a new module:

```bash
 nest g module <module-name>

```

**Generating a Service**

To generate a new service:

```bash
 nest g service <service-name>

```

**Generating a Controller**

To generate a new controller:

```bash
 nest g controller <controller-name>

```

**Generating a new resource**

To create a new resource, simply run the following command in the root directory of your project:

```bash
 nest g resource

```
command not only generates all the NestJS building blocks (module, service, controller classes) but also an entity class, DTO classes as well as the testing (.spec) files.

## Updating Dependencies

To update the dependencies to their latest versions:

```bash
 npm update

```




# Happy Backend
