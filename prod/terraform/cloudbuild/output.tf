output "cloudbuild" {
  value = {
    mainImage = "${local.image}:eae2a47b74468e786306302d29a9aae5b9272f8a"
  }
}
