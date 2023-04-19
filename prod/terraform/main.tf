terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "4.61.0"
    }
  }

  required_version = ">= 1.4.0"
}

provider "google" {
  project = var.envs.project
  region  = var.envs.region
}


data "google_billing_account" "specfy" {
  display_name = "Specfy"
  open         = true
}


resource "google_project" "specfy" {
  name       = var.envs.project
  project_id = var.envs.project

  billing_account = data.google_billing_account.specfy.id

  auto_create_network = false
}

module "google" {
  source = "./google"
  depends_on = [
    google_project.specfy
  ]

  envs = var.envs
}

module "secrets" {
  source = "./secrets"
  depends_on = [
    module.google
  ]
}

module "cloudbuild" {
  source = "./cloudbuild"
  depends_on = [
    module.google,
    module.secrets
  ]

  envs = var.envs
}


module "gcs" {
  source = "./gcs"
  depends_on = [
    google_project.specfy,
    module.google
  ]

  envs = var.envs
}

module "network" {
  source = "./network"
  depends_on = [
    google_project.specfy,
    module.google
  ]

  envs = var.envs
}

module "sql" {
  source = "./sql"
  depends_on = [
    data.google_billing_account.specfy,
    module.network
  ]

  envs    = var.envs
  network = module.network.network
}

# module "gce" {
#   source = "./gce"
#   depends_on = [
#     data.google_billing_account.specfy,
#     module.network,
#     module.sql
#   ]

#   envs    = var.envs
#   network = module.network.network
#   sql = module.sql.sql
# }


module "run" {
  source = "./run"
  depends_on = [
    module.cloudbuild,
    module.sql
  ]

  envs       = var.envs
  sql        = module.sql.sql
  cloudbuild = module.cloudbuild.cloudbuild
}