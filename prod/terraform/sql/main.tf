resource "google_sql_database_instance" "specfy" {
  project             = var.envs.project
  name                = var.envs.project
  region              = var.envs.region
  database_version    = "POSTGRES_14"
  deletion_protection = "true"

  settings {
    tier              = "db-f1-micro"
    activation_policy = "ALWAYS"

    ip_configuration {
      ipv4_enabled                                  = true
      private_network                               = var.network.id
      enable_private_path_for_google_cloud_services = true
    }
    insights_config {
      query_insights_enabled  = false
      query_plans_per_minute  = 0
      query_string_length     = 1000
      record_application_tags = false
      record_client_address   = false
    }

    maintenance_window {
      day  = 1
      hour = 6
    }
  }
}

data "google_secret_manager_secret_version" "DB_PASSWORD" {
  secret   = "DB_PASSWORD"
}

resource "google_sql_user" "main" {
  instance = google_sql_database_instance.specfy.name
  type     = "BUILT_IN"

  name     = "main"
  password = data.google_secret_manager_secret_version.DB_PASSWORD.secret_data
}
