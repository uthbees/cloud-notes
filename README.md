## Overview

**Project Title**: Cloud notes API

**Project Description**: An API for a cloud notes application

**Project Goals**: The goal of this sprint is to create an API that I can use to back one or more frontends that I build in future sprints. The goal of the overall project is to provide a platform for saving notes on the cloud with a better UI than other platforms I've tried.

## Instructions for Build and Use

Steps to build and/or run the software:

1. Clone the repository:

```bash
git clone https://github.com/uthbees/cloud-notes.git
```

2. Install the project dependencies (run in the project directory):

```bash
npm install
```

3. Install mysql: https://dev.mysql.com/downloads/installer/
4. Make sure the mysql service is running (differs per OS): https://www.google.com/search?q=how+to+tell+if+mysql+is+running
5. Using [mysql workbench](https://dev.mysql.com/downloads/workbench/) or the command line, initialize the database by running the server/init-db.sql file.
6. Create a .env file in the root directory, referencing .env.example for directions on what to include.
7. In separate terminals, run `npm run server` and `npm run api-spec` (both in the project directory). A page should open in your browser.

Instructions for using the software:

This is just an API for now, so all I have for a frontend is the Swagger UI API specification page. It should still work though - you can query the API endpoints under the "in scope" section using the "try it out" buttons. First click "try it out", then fill in the parameters and/or the request body, then click "execute". The response will be shown below.

Note that the API does a few things that are somewhat unintuitive - for example, the GET method on the /notes endpoint does not give you the contents of any notes for performance reasons. This and a few other similarly unintuitive things are intentional design decisions motivated by the way I want the final product to behave. (They're all documented, but they can still be confusing.)

## Development Environment

To recreate the development environment, you need the following software and/or libraries with the specified versions:

If you have it set up to run, you have it set up to develop. (I don't understand the point of this section?)

## Useful Websites to Learn More

I found these websites useful in developing this software:

-   [Swagger's OpenAPI tutorial/reference](https://swagger.io/docs/specification/v3_0/about/)
-   [mysql2 docs](https://sidorares.github.io/node-mysql2/docs/documentation) (mysql2 is a library that lets you use mysql from node)
-   [express docs](https://expressjs.com/)
-   [StackOverflow](https://stackoverflow.com/)/[Google](https://www.google.com/)

## Future Work

The following items I plan to fix, improve, and/or add to this project in the future:

-   [ ] Implement the rest of the endpoints - I didn't have time this sprint, but I'll need them if I want to finish the project. (I may not finish this during this semester, but that's okay.)
-   [ ] Use zod (or a similar library) for validating request bodies/parameters instead of doing it manually.
-   [ ] Reduce boilerplate with middleware and/or functions shared between endpoints.

There will also be plenty of bugs to fix and overlooked requirements to implement as I start trying to actually use the API with various frontends.
