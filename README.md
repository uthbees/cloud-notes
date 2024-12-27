## Cloud Notes

This project was intended to be a cloud-based note-taking application for mobile, web, and potentially desktop, with the goal of having a better UI than the application I was previously using (Google Keep). Unfortunately, I took too long to make this, so now I have a solution to the problem that doesn't involve fifty to a hundred hours of work. :)

Status: The API is fully specced and the first four endpoints are implemented. (I really didn't get very far.)

#### Instructions

There are no frontends right now, but you can use the Swagger UI for the API specification as a substitute.

Clone the repository:

```bash
git clone https://github.com/uthbees/cloud-notes.git
```

Install the project dependencies (run in the project directory):

```bash
npm install
```

Install mysql: https://dev.mysql.com/downloads/installer/

First, make sure the mysql service is running (this differs per OS). Then, using [mysql workbench](https://dev.mysql.com/downloads/workbench/) or the command line, initialize the database by running the server/init-db.sql file.

Create a .env file in the root directory, referencing .env.example for directions on what to include.

In separate terminals, run `npm run server` and `npm run api-spec` (both in the project directory). The Swagger UI should open in your browser.

Note that the API does a few things that are somewhat unintuitive - for example, the GET method on the /notes endpoint does not give you the contents of any notes for performance reasons. This and a few other similarly unintuitive things are intentional design decisions motivated by the way I want the final product to behave. (They're all documented, but they can still be confusing.)

#### To do

-   [ ] Implement the rest of the endpoints.
-   [ ] Use arktype for validating request bodies/parameters instead of doing it manually.
-   [ ] Reduce boilerplate with middleware and/or functions shared between endpoints.
-   [ ] Create the frontends.
