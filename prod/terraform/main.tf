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


module "gcs" {
  source = "./gcs"
  depends_on = [
    google_project.specfy
  ]

  envs = var.envs
}

module "network" {
  source = "./network"
  depends_on = [
    google_project.specfy
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
  network = module.network.id
}

module "cloudbuild" {
  source = "./cloudbuild"
  depends_on = [
  ]

  envs    = var.envs
}

