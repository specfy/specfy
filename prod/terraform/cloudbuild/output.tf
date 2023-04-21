output "cloudbuild" {
  value = {
    mainImage = "${local.image}:47b551eeea13838ca9d3e12ab69cad5dffc7793c"
  }
}
