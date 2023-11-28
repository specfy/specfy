# Installation

## Prerequisites

- [Node.js](https://nodejs.org/en) version >=16.x
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

   Feel free to update `COOKIE_SECRET` and `PASSWORD_SALT`. See [Secrets](#secrets) section

06. Start Docker. This starts the required services like Postgres.

   ```sh
   docker compose up -d
   ```

07. Migrate the database

   ```sh
   turbo run db:migrate
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

11. Optional: Seed the Database

   > [!CAUTION]
   > You need the API to be running to seed

   ```sh
   turbo run db:seed
   ```

12. Optional: Launch the mail builder

   ```sh
   npm run emails
   ```

   Go to [http://localhost:3001](http://localhost:3001)

14. ✅ Done.

## Secrets

To run this project, locally or in production, you will need a few secrets.

### Creating the GitHub App

You will need a [GitHub](https://github.com/settings/apps/new) app to allow oauth.

Configuration:

- Callback: <https://api.specfy.io/0/auth/github/cb>
- [x] Identifying >Request user authorization (OAuth) during installation
- [x] Post installation > Redirect on update
- [x] Webhook > Active
  - Callback: <https://api.specfy.io/0/github/webhooks>

Permissions (read-only):

- Repository: Commit Statuses, Contents, Deployments, Environments, Metadata
- Org: Members
- Account: Email addresses

Subscribe to events:

- Meta, Member, Membership, Organization, Public, Push, Repository, Team, Team add

### Others Secrets

- [Resend](https://resend.com) key to send email
- [Stripe](https://stripe.com) key to allow billing
- [Datadog](https://datadoghq.com) key for metrics collection
- [Open AI](https://openai.com) key for AI operations
