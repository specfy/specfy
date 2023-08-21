# Deploy

## Using Terraform

> This part is for internal purpose but can help understand how to deploy manually

This repository comes with an "exhaustive" Terraform setup. It currently setup a GCP Project, with Cloud Run, Cloud SQL, etc.

```sh
cd prod/terraform
./run.sh prod apply
```

On first execution:

- it can take up to 15minutes, because Cloud SQL is long to provision the first time
- it will fail because you need to manually fill the secrets in the Secret Manager
- it requires a billing profil, that can not be provisioned
- it requires a built Docker Image which is build by Cloud Build

## Manually

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
