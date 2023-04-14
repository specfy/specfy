resource "google_cloudbuild_trigger" "filename-trigger" {
  location = var.envs.region

  # Require manual intervention in cloud build UI
  github {
    owner = "bodinsamuel"
    name = "specfy"
    push {
      branch = "^main$"
    }
  }

  build {
    step {
      name = "gcr.io/cloud-builders/docker"
      args = ["build", "-t", "gcr.io/${var.envs.project}/main", "-f", "prod/Dockerfile", "."]
    }

    images = [ "gcr.io/${var.envs.project}/main" ]
  }
}
