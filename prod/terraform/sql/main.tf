resource "google_sql_database_instance" "specfy" {
  project             = var.envs.project
  name                = var.envs.project
  region              = var.envs.region
  database_version    = "POSTGRES_14"
  deletion_protection = "true"

  settings {
    tier              = var.envs.sql.machine
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

    backup_configuration {
      enabled    = true
      start_time = "08:00"
      location   = "us"
      backup_retention_settings {
        retained_backups = 10
      }
    }

    database_flags {
      name  = "max_connections"
      value = "100"
    }
    database_flags {
      name  = "shared_buffers"
      value = "58152"
    }
    database_flags {
      name  = "maintenance_work_mem"
      value = "62500"
    }
    database_flags {
      name  = "checkpoint_completion_target"
      value = "0.9"
    }
    database_flags {
      name  = "wal_buffers"
      value = "1000"
    }
    database_flags {
      name  = "default_statistics_target"
      value = "100"
    }
    database_flags {
      name  = "random_page_cost"
      value = "1.1"
    }
    database_flags {
      name  = "work_mem"
      value = "6553"
    }
    database_flags {
      name  = "huge_pages"
      value = "off"
    }
    database_flags {
      name  = "min_wal_size"
      value = "500"
    }
  }
}

data "google_secret_manager_secret_version" "DB_PASSWORD" {
  secret = "DB_PASSWORD"
}

resource "google_sql_user" "main" {
  instance = google_sql_database_instance.specfy.name
  type     = "BUILT_IN"

  name     = "main"
  password = data.google_secret_manager_secret_version.DB_PASSWORD.secret_data
}
