output "cloudbuild" {
  value = {
    mainImage = "${local.image}:fb2f6d062a0ae0968073af7405b3fbd222dad0dd"
  }
}
