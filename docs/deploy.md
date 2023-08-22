# Deploy

## Deploy Manually

You will need:

- A Postgres instance
- One, or many, processes to serve:
  - Api + Job consumer
  - App (dashboard frontend)
  - Emails
- [Github](https://github.com) app to allow oauth
- [Resend](https://resend.com) key to send email
- [Stripe](https://stripe.com) key to allow billing
- [Datadog](https://datadoghq.com) key for metrics collection
- Fill all secrets required in `.env.example` or in your deploy env

### Building source code

```sh
# Backend
npx turbo run build --ignore app

# Frontend
npx turbo run build --filter app
```

You should check the current [Dockerfile](../prod/Dockerfile) for inspiration.
NB: specfy.io is currently built and hosted by [Vercel](https://vercel.com)

## Using Terraform

Read [Deploy with Terraform](./deploy.terraform.md)
