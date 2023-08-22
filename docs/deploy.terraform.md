# Deploy with Terraform

> This part is mostly for internal purpose but can work for you with some manual change

This repository comes with an "exhaustive" Terraform setup. It currently setup a GCP Project, with Cloud Run, Cloud SQL, etc.
Note that since Terraform is not really good at handling many dependencies and steps, it is expected to fail multiple times, when run the first time, before reaching a good state.
It would be interesting to rework this setup to use multiple state.

## Setup

1. Have a billing profil ready and provisionned
2. Create a GCP project for the Terraform state (name is not relevant)
3. Create a GCS Bucket
   1. Put this name in `backend.tf`
4. Connect to gcloud `gcloud auth application-default login` (useful if you have multiple accounts connected)
5. `terraform init -reconfigure`
6. Create `prod` workspace `terraform workspace new prod`

### Env

Go to `env/prod.tfvars`

1. Change the name of GCP project that will host the deploy (in: `project`)
2. Disable the `dns` since it will fail until manual intervention (in: `dns.enabled`)
3. Put your own billing account name  (in: `billingAccount`)

## 1st execution

`cd prod/terraform && ./run.sh prod apply`

Note:

- Initial project creation can take more than **300 seconds**

> [!NOTE]<br>
> It is **expected to fail**

- it requires a built Docker Image which is build by [Cloud Build](https://console.cloud.google.com/cloud-build/dashboard)

### Cloud Build

> [!NOTE]<br>
> The alernative is to skip this part by commenting `module "cloudbuild" {` in `main.tf`. You will need to provide your own docker image

1. Go to https://console.cloud.google.com/cloud-build/repositories/1st-gen
2. Connect to 1st gen repository
3. DO NOT create a trigger (press "Done")

### DNS

The DNS configuration will fail since it's configured to run on `specfy.io`
You can change the value manually in `network/dns.tf`. If you don't have a domain or you are temporarly setuping thing, it's recommended to disable DNS Configuration.

## 2nd execution

`./run.sh prod apply`

If you have done everything rights it will now setup the Database:

> [!NOTE]<br>
> Cloud SQL will take up to **10-15 minutes**, to provision the first time.

> [!NOTE]<br>
> It is, once again, **expected to fail**

### Secrets

Fill the secrets in [Secrets Manager](https://console.cloud.google.com/security/secret-manager)

## 3rd execution

1. The trigger in cloud build is now created, you can build the image manually by going to Cloud Build > Trigger > Run
2. The image hash will be the last commit
   1. If you are not deploying the last commit you can change the hash in `run.sh`

`./run.sh prod apply`

You should now have a successful execution!
*But it's not over yet*

1. Migrate the database
   1. Go to [Cloud Run](https://console.cloud.google.com/run/jobs) > Jobs > Migrate > Click "Execute"
2. Allow external access
   1. Go to [Cloud Run](https://console.cloud.google.com/run) > Services > "main" > Security > Check "Allow unauthenticated invocations"
3. Go to the Cloud Run url:
   1. Default should output a JSON 401 `{"error":{"code":"401_unauthorized"}}`
   2. Add `/O/` (e.g: `https://main-yos25gua4a-uc.a.run.app/0/`) should output `{"root":true}`

You have deployed the main infrastructure and the API , good job!

## Going Further

- You should configure your DNS to point to the appropriate domain, e.g: api.specfy.io
  - Go to Cloud Run > Manage Custom Domains and configure the domain of your choice (can take 10-30minutes)
- You should host the `App` on the frontend host of your choice, recommended Vercel
