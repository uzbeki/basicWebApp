# With Docker Compose

This example contains everything needed to get a Next.js development and production environment up and running with Docker Compose.

## How to use
Clone this repository to your local machine.

```bash
git clone https://github.com/uzbeki/basicWebApp.git
```

Optionally, after the installation is complete:

- Run `cd next-app`, then run `npm install` or `yarn install` or `pnpm install` to generate a lockfile.

It is recommended to commit a lockfile to version control. Although the example will work without one, build errors are more likely to occur when using the latest version of all dependencies. This way, we're always using a known good configuration to develop and run in production.

## Prerequisites

Install [Docker Desktop](https://docs.docker.com/get-docker) for Mac, Windows, or Linux. Docker Desktop includes Docker Compose as part of the installation.

## Development

First, run the development server:

```bash
# Create a network, which allows containers to communicate
# with each other, by using their container name as a hostname
docker network create my_network

# Build dev
docker compose -f docker-compose.dev.yml build

# Up dev
docker compose -f docker-compose.dev.yml up
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Production

Multistage builds are highly recommended in production. Combined with the Next [Output Standalone](https://nextjs.org/docs/advanced-features/output-file-tracing#automatically-copying-traced-files) feature, only `node_modules` files required for production are copied into the final Docker image.

First, run the production server (Final image approximately 110 MB).

```bash
# Create a network, which allows containers to communicate
# with each other, by using their container name as a hostname
docker network create my_network

# Build prod
docker compose -f docker-compose.prod.yml build

# Up prod in detached mode
docker compose -f docker-compose.prod.yml up -d
```

Alternatively, run the production server without without multistage builds (Final image approximately 1 GB).

```bash
# Create a network, which allows containers to communicate
# with each other, by using their container name as a hostname
docker network create my_network

# Build prod without multistage
docker compose -f docker-compose.prod-without-multistage.yml build

# Up prod without multistage in detached mode
docker compose -f docker-compose.prod-without-multistage.yml up -d
```

Open [http://localhost:3000](http://localhost:3000).

## Useful commands

```bash
# Stop all running containers
docker kill $(docker ps -aq) && docker rm $(docker ps -aq)

# Free space
docker system prune -af --volumes
```


# Testing
Testing is done with Jest and React Testing Library. To run the tests, run `npm run test` or `yarn test` or `pnpm test`.
Tests are located in the `__tests__` directory. 

# Database used
Sqlite3 is used to store column names and their hashes. 
> Beware that sqlite3 is not suitable for production. It is used here for simplicity. If you stop docker container, all data will be lost.

# Running without docker
If you want to run the app without docker, you need to install nodejs and npm.

Then inside `next-app` directory,  run `npm install` or `yarn install` or `pnpm install` to generate a lockfile.

After that, run `npm run dev` or `yarn dev` or `pnpm dev` to start the app in development mode.

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
