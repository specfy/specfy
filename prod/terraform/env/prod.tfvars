envs = {
  env            = "prod"
  project        = "specfy-prod2"
  region         = "us-central1"
  billingAccount = "Specfy"

  dns = {
    enabled = true
  }

  sql = {
    machine = "db-custom-1-3840"
  }
}
