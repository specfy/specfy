output "cloudbuild" {
  value = {
    mainImage = "${local.image}:f3f912aaf276d0bdfbf74a0cf919b75078e3c3a4"
  }
}
