output "cloudbuild" {
  value = {
    mainImage = "${local.image}:b392a7ea8e92739d42ec5d91f3772c717a5fc408"
  }
}
