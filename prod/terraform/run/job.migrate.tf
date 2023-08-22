resource "google_cloud_run_v2_job" "migrate" {
  name         = "migrate"
  location     = var.envs.region
  launch_stage = "BETA"

  template {
    parallelism = 1
    task_count = 1
    template {
      max_retries = 0

      containers {
        image = var.cloudbuild.mainImage
        command = [
          "npm",
        ]
        args = [
          "run",
          "-w",
          "@specfy/db",
          "prod:migrate",
        ]

        env {
          name  = "DATABASE_URL"
          value = "${var.sql.hostname}@localhost:5432/postgres?host=/cloudsql/${var.sql.instance}"
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
  }

  lifecycle {
    ignore_changes = [
      launch_stage,
    ]
  }
}
