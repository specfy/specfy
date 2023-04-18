locals {
  image = "gcr.io/${var.envs.project}/main"
}

resource "google_service_account" "default" {
  account_id   = "cloudbuild"
  display_name = "Cloud Build Main"
}

resource "google_project_iam_member" "default" {
  for_each = toset(["roles/cloudbuild.builds.builder", "roles/storage.admin", "roles/storage.objectAdmin", "roles/logging.logWriter", "roles/iam.serviceAccountUser"])

  project = var.envs.project
  role    = each.value
  member  = "serviceAccount:${google_service_account.default.email}"
}

resource "google_cloudbuild_trigger" "filename-trigger" {
  location        = var.envs.region
  service_account = google_service_account.default.id


  # Require manual intervention in cloud build UI
  github {
    owner = "bodinsamuel"
    name  = "specfy"
    push {
      branch = "^main$"
    }
  }


  build {
    images = [local.image]
    options {
      logging = "CLOUD_LOGGING_ONLY"
    }

    // Pull cache
    step {
      name       = "gcr.io/cloud-builders/docker"
      entrypoint = "bash"
      args       = ["-c", "docker pull ${local.image} || exit 0"]
    }

    step {
      name = "gcr.io/cloud-builders/docker"
      args = [
        "build",
        "--build-arg=git_hash=$SHORT_SHA",
        "-t", local.image,
        "--cache-from", "${local.image}:latest",
        "-f", "prod/Dockerfile",
        "."
      ]
    }

  }
}
