terraform {
  backend "gcs" {
    bucket = "terraform-specfy-prod" # GCS Bucket name
    prefix = "terraform/state"
  }
}
