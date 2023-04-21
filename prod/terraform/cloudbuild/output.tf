output "cloudbuild" {
  value = {
    mainImage = "${local.image}:4240fea3c4cfb949b1294f015cf2e1bbf48e662b"
  }
}
