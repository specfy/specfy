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
- Fill all secrets required in `pkgs/app/.env.example`
