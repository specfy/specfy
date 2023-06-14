output "cloudbuild" {
  value = {
    mainImage = "${local.image}:4cf0768761de0314a2cbad36f82056e2c7b98f34"
  }
}
