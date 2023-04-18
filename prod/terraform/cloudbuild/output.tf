output "cloudbuild" {
  value = {
    mainImage = "gcr.io/${var.envs.project}/main"
  }
}
