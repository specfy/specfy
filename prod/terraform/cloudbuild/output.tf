output "cloudbuild" {
  value = {
    mainImage = "${local.image}:${var.docker_image_version}"
  }
}
