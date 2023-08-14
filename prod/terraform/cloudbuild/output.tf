output "cloudbuild" {
  value = {
    mainImage = "${local.image}:1b26ded7bf48a406fe18379e8dc1890497441f5f"
  }
}
