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


      // TODO: remove this
      env {
        name  = "DEFAULT_ACCOUNT"
        value = "demo@specfy.com"
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
