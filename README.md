# JustReddit

This is basic just-like-reddit app for me to explore some tech stacks.

## Tech Stack

1. Typescript
2. Next.js
3. React
4. Urql
5. Apollo
6. GraphQL
7. Node.js / Express
8. Postgres
9. Redis
10. TypeORM
11. TypeGraphQL
12. Chakra

## Installation / Setup

### Localhost

1. cd into server folder
2. Create a .env file, you can base it upon the example env file in .env.example
3. Setup a postgres db with your desired name and ensure that the db connection string matches the one in your .env file
4. Setup your localhost redis server on an ubuntu environment, you may use a WSL Ubuntu instance for this. Visit guide on official redis docs for more details.
5. Run `yarn install`
6. Compile the js files using `yarn build` or `yarn watch`
7. Start the server using `yarn dev`
8. Note: There is also a dockerfile if you want to use docker, however it only sets up the server and not the postgres instance, redis instance nor the front end instance
9. cd into web folder
10. Create a .env.local file, you can base it upon the example env file in .env.example
11. Run `yarn install`
12. Run `yarn dev`
13. You can now access the app from your front end client.

### Production

1. Use a hosting platform to set up a project with instances of postgres and redis
2. Setup the environment variables in your production environment similar to the ones explained in localhost section step 2, you can do this in many ways, e.g. using hosting platform env var injector, having a script or some sort of automation to set up those environment variables from your code. Remember to also set NODE_ENV to production here
3. Connect your repo to the hosting platform and let it automatically deploy your app from the dockerfile
4. Head over to vercel and host the front end platform using vercel. This can be as simple as running the command `vercel` or `vercel --prod` in the web directory after logging in with `vercel login`
5. Remember to setup the environment variables here too similar to localhost section step 10
6. Your app should work now from your deployed production frontend link.

## Mock data

In development, if you would like some mock data, you can head over to server/src/migrations and uncomment the queries (swap the method signature too), and then change the file and class name to a slightly different timestamp number prefix to trigger the migration on your next boot up of the server.
