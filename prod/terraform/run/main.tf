data "google_secret_manager_secret_version" "PASSWORD_SALT" {
  secret = "PASSWORD_SALT"
}
data "google_secret_manager_secret_version" "COOKIE_SECRET" {
  secret = "COOKIE_SECRET"
}
data "google_secret_manager_secret_version" "GITHUB_CLIENT_APPID" {
  secret = "GITHUB_CLIENT_APPID"
}
data "google_secret_manager_secret_version" "GITHUB_CLIENT_ID" {
  secret = "GITHUB_CLIENT_ID"
}
data "google_secret_manager_secret_version" "GITHUB_CLIENT_SECRET" {
  secret = "GITHUB_CLIENT_SECRET"
}
data "google_secret_manager_secret_version" "GITHUB_CLIENT_PKEY" {
  secret = "GITHUB_CLIENT_PKEY"
}
data "google_secret_manager_secret_version" "GITHUB_WEBHOOKS_SECRET" {
  secret = "GITHUB_WEBHOOKS_SECRET"
}
data "google_secret_manager_secret_version" "RESEND_KEY" {
  secret = "RESEND_KEY"
}
data "google_secret_manager_secret_version" "STRIPE_KEY" {
  secret = "STRIPE_KEY"
}
data "google_secret_manager_secret_version" "STRIPE_WEBHOOKS_SECRET" {
  secret = "STRIPE_WEBHOOKS_SECRET"
}
data "google_secret_manager_secret_version" "JWT_SECRET" {
  secret = "JWT_SECRET"
}
data "google_secret_manager_secret_version" "DD_API_KEY" {
  secret = "DD_API_KEY"
}
data "google_secret_manager_secret_version" "OPENAI_KEY" {
  secret = "OPENAI_KEY"
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
        name  = "GITHUB_WEBHOOKS_SECRET"
        value = data.google_secret_manager_secret_version.GITHUB_WEBHOOKS_SECRET.secret_data
      }
      env {
        name  = "RESEND_KEY"
        value = data.google_secret_manager_secret_version.RESEND_KEY.secret_data
      }
      env {
        name  = "STRIPE_KEY"
        value = data.google_secret_manager_secret_version.STRIPE_KEY.secret_data
      }
      env {
        name  = "STRIPE_WEBHOOKS_SECRET"
        value = data.google_secret_manager_secret_version.STRIPE_WEBHOOKS_SECRET.secret_data
      }
      env {
        name  = "JWT_SECRET"
        value = data.google_secret_manager_secret_version.JWT_SECRET.secret_data
      }
      env {
        name  = "DD_API_KEY"
        value = data.google_secret_manager_secret_version.DD_API_KEY.secret_data
      }
      env {
        name  = "OPENAI_KEY"
        value = data.google_secret_manager_secret_version.OPENAI_KEY.secret_data
      }



      env {
        name  = "APP_HOSTNAME"
        value = "https://app.specfy.io"
      }
      env {
        name  = "API_HOSTNAME"
        value = "https://api.specfy.io"
      }

      env {
        name  = "GIVE_DEFAULT_PERMS_TO_EMAIL"
        value = ""
      }

      env {
        name  = "DEFAULT_ACCOUNT"
        value = ""
      }


      volume_mounts {
        mount_path = "/cloudsql"
        name       = "cloudsql"
      }
      resources {
        limits = {
          memory = "512Mi"
          cpu    = "1000m"
        }
        cpu_idle          = false
        startup_cpu_boost = true
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
