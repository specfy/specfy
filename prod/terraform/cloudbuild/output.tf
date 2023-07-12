output "cloudbuild" {
  value = {
    mainImage = "${local.image}:8188cf96619a4d0e87d58e52794195e445de0bbb"
  }
}
