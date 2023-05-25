output "cloudbuild" {
  value = {
    mainImage = "${local.image}:398b48b5d709f179fae3596e1cfba4cadc424956"
  }
}
