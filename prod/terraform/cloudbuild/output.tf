output "cloudbuild" {
  value = {
    mainImage = "${local.image}:51f27e876655a0ee9ca72975fe5b58c24dc4dc97"
  }
}
