terraform {
  backend "gcs" {
    bucket      = "specfy-terraform"
    prefix      = "terraform/state"
  }
}
