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

The database for the application can be configured using properties in the .env file. 

- create a .enf file in the root folder.
- change the values of the properties with your connection params. 

sample:
```
# MySQL DB Configurations
DB_HOST = localhost
DB_USERNAME = root
DB_PASSWORD = root
DB_PORT = 3306
DB_NAME = database_name

# .env
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=user@email.com
MAIL_PASSWORD=grge xxxx xxxx xxxx
MAIL_FROM=user@gmail.com

# Set Environment (Use 'PROD' or 'DEV')
SET_ENV = 'DEV'

# AWS credentials
AWS_ACCESS_KEY_ID=ABCDEFGHIJKLMNOPQRST
AWS_SECRET_ACCESS_KEY=vxxxxxxxxxxxxxxxxxxxxxxxxx
AWS_S3_BUCKET_NAME=fraxionedawsbucket

# image configurations
MAX_FILE_SIZE=31457280
ALLOWED_EXTENSIONS=.jpg,.jpeg,.png,.gif
MAX_FILE_COUNT=50
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
