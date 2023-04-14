resource "google_sql_database_instance" "specfy" {
  project          = var.envs.project
  name             = var.envs.project
  region           = var.envs.region
  database_version = "POSTGRES_14"

  settings {
    tier = "db-f1-micro"
    ip_configuration {
      ipv4_enabled                                  = false
      private_network                               = var.network
      enable_private_path_for_google_cloud_services = true
    }
  }

  deletion_protection = "true"
}
