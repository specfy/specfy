output "cloudbuild" {
  value = {
    mainImage = "${local.image}:20191ad505243850530271b2def778f769011719"
  }
}
