output "cloudbuild" {
  value = {
    mainImage = "${local.image}:4e871875d972fbec4c5de195c7e45dd948418531"
  }
}
