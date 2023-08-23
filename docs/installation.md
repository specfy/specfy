# Installation

## Prerequisites

- [Node.js](https://nodejs.org/en) version >=16.x
- [pnpm package manager](https://pnpm.io/installation) version 7
- [Docker](https://www.docker.com/get-started/)

Optional:

- Ngrok
- Terraform

## Setup

01. Clone the repo

   ```sh
   git clone https://github.com/specfy/specfy.git
   ```

02. Navigate to the project folder

   ```sh
   cd specfy
   ```

03. Install the required packages using pnpm.

   ```sh
   nvm use
   npm install
   npm install -g turbo
   ```

04. Create your `.env` files

   ```sh
   cp .env.example .env
   ```

05. Open the root `.env` file:

   ```sh
   code /.env
   ```

   Feel free to update `COOKIE_SECRET` and `PASSWORD_SALT`.

06. Start Docker. This starts the required services like Postgres.

   ```sh
   docker compose up -d
   ```

07. Migrate and seed the database

   ```sh
   turbo run migrate
   turbo run seed
   ```

08. Build

   ```sh
   npm run build
   ```

09. Launch the API

   ```sh
   npm run api
   ```

   Go to [http://localhost:3000](http://localhost:3000)

10. Launch the App

   ```sh
   npm run app
   ```

   Go to [http://localhost:5173](http://localhost:5173)

11. Optional: Launch the mail builder

   ```sh
   npm run emails
   ```

   Go to [http://localhost:3001](http://localhost:3001)

12. Done.
