# Installation

## Prerequisites

- [Node.js](https://nodejs.org/en) version >=16.x
- [pnpm package manager](https://pnpm.io/installation) version 7
- [Docker](https://www.docker.com/get-started/)

Optional:

- Ngrok
- Terraform

## Setup

1. Clone the repo

   ```sh
   git clone https://github.com/specfy/specfy.git
   ```

2. Navigate to the project folder

   ```sh
   cd specfy
   ```

3. Install the required packages using pnpm.

   ```sh
   nvm use
   npm install
   ```

4. Create your `.env` files

   ```sh
   cp pkgs/api/.env.example pkgs/api/.env
   ```

5. Open the root `.env` file:

   ```sh
   code pkgs/api/.env
   ```

   Feel free to update `COOKIE_SECRET` and `PASSWORD_SALT`.

6. Start Docker. This starts the required services like Postgres.

   ```sh
   docker compose up -d
   ```

7. Migrate and seed the database

   ```sh
   npm run -w @specfy/api migrate
   npm run -w @specfy/api seed
   ```

8. Launch the API

   ```sh
   npm run api
   ```

    Go to [http://localhost:3000](http://localhost:3000)

9. Launch the App

   ```sh
   npm run app
   ```

   Go to [http://localhost:5173](http://localhost:5173)

10. Optional: Launch the mail builder

   ```sh
   npm run emails
   ```

   Go to [http://localhost:3001](http://localhost:3001)
