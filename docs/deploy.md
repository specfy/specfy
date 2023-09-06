# Deploy


![app specfy io_public](https://github.com/specfy/specfy/assets/1637651/fecfb292-e2e3-4ad4-93dd-714a1fc20b1a)
*Map of the current infrastucture*


## Deploy using Terraform

Read [Deploy with Terraform](./deploy.terraform.md)


## Deploy Manually

You will need:

- A Postgres instance
- One, or many, processes to serve:
  - Api + Job consumer
  - App (dashboard frontend)
  - Emails
- Fill all secrets required in `.env.example` or in your deploy env. See [Secrets](installation.md#secrets)

### Building source code

```sh
# Backend
npx turbo run build --ignore app

# Frontend
npx turbo run build --filter app
```

You should check the current [Dockerfile](../prod/Dockerfile) for inspiration.
NB: specfy.io is currently built and hosted by [Vercel](https://vercel.com)

