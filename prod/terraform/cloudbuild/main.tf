resource "google_cloudbuild_trigger" "filename-trigger" {
  location = var.envs.region

  github {
    owner = "bodinsamuel"
    name = "specfy"
    push {
      branch = "main"
    }
  }

  # filename = "cloudbuild.yaml"
  build {
    step {
      name = "gcr.io/cloud-builders/docker"
      args = ["build", "-t", "gcr.io/${var.envs.project}/main", "-f", "prod/Dockerfile"]
    }

    images = [ "gcr.io/${var.envs.project}/api" ]
  }
}
