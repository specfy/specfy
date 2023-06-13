data "google_secret_manager_secret_version" "PASSWORD_SALT" {
  secret   = "PASSWORD_SALT"
}
data "google_secret_manager_secret_version" "COOKIE_SECRET" {
  secret   = "COOKIE_SECRET"
}
data "google_secret_manager_secret_version" "GITHUB_CLIENT_APPID" {
  secret   = "GITHUB_CLIENT_APPID"
}
data "google_secret_manager_secret_version" "GITHUB_CLIENT_ID" {
  secret   = "GITHUB_CLIENT_ID"
}
data "google_secret_manager_secret_version" "GITHUB_CLIENT_SECRET" {
  secret   = "GITHUB_CLIENT_SECRET"
}
data "google_secret_manager_secret_version" "GITHUB_CLIENT_PKEY" {
  secret   = "GITHUB_CLIENT_PKEY"
}

resource "google_cloud_run_v2_service" "main" {
  name     = "main"
  location = var.envs.region
  ingress  = "INGRESS_TRAFFIC_ALL"
  client   = "cloud-console"

  template {
    scaling {
      min_instance_count = 0
      max_instance_count = 2
    }

    containers {
      image = var.cloudbuild.mainImage
      command = [
        "node",
      ]
      args = [
        "pkgs/api/build/index.js",
      ]


      env {
        name  = "DATABASE_URL"
        value = "${var.sql.hostname}@localhost:5432/postgres?host=/cloudsql/${var.sql.instance}"
      }


      env {
        name  = "PASSWORD_SALT"
        value = data.google_secret_manager_secret_version.PASSWORD_SALT.secret_data
      }
      env {
        name  = "COOKIE_SECRET"
        value = data.google_secret_manager_secret_version.COOKIE_SECRET.secret_data
      }
      env {
        name  = "GITHUB_CLIENT_APPID"
        value = data.google_secret_manager_secret_version.GITHUB_CLIENT_APPID.secret_data
      }
      env {
        name  = "GITHUB_CLIENT_ID"
        value = data.google_secret_manager_secret_version.GITHUB_CLIENT_ID.secret_data
      }
      env {
        name  = "GITHUB_CLIENT_SECRET"
        value = data.google_secret_manager_secret_version.GITHUB_CLIENT_SECRET.secret_data
      }
      env {
        name  = "GITHUB_CLIENT_PKEY"
        value = data.google_secret_manager_secret_version.GITHUB_CLIENT_PKEY.secret_data
      }

      env {
        name ="APP_HOSTNAME"
        value = "https://app.specfy.io"
      }
      env {
        name = "API_HOSTNAME"
        value = "https://api.specfy.io"
      }

      // TODO: remove this
      env {
        name  = "DEFAULT_ACCOUNT"
        value = "demo@specfy.io"
      }

      volume_mounts {
        mount_path = "/cloudsql"
        name       = "cloudsql"
      }
    }


    volumes {
      name = "cloudsql"

      cloud_sql_instance {
        instances = [var.sql.instance]
      }
    }
  }

  traffic {
    type    = "TRAFFIC_TARGET_ALLOCATION_TYPE_LATEST"
    percent = 100
  }
}
