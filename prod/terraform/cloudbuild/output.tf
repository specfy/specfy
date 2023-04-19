output "cloudbuild" {
  value = {
    mainImage = "${local.image}:b6627f5c1cd58f585e7d6cb09c0217ad0a285d02"
  }
}
