# Contributing

## Installation

Requires:

- Docker
- Node

Optional:

- Ngrok
- Terraform

```sh
nvm use
npm install
```

## Launch

```sh
# Services
docker compose up -d

# Backend
npm run api
npm run -w @specfy/api seed

# Frontend
npm run app

# Emails
npm run emails

# Website
npm run -w @specfy/website dev
```

Go to:

- App [http://localhost:5173](http://localhost:5173)
- Api [http://localhost:3000](http://localhost:3000)
