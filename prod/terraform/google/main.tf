
resource "google_project_service" "service" {
  project = var.envs.project

  for_each = toset([
    "compute.googleapis.com",
    "container.googleapis.com",
    "servicenetworking.googleapis.com",
    "cloudbuild.googleapis.com",
    "containerregistry.googleapis.com",
    "storage-api.googleapis.com",
    "sql-component.googleapis.com",
    "storage-component.googleapis.com",
    "dns.googleapis.com",
    "secretmanager.googleapis.com",
    "run.googleapis.com",
    "vpcaccess.googleapis.com",
    "sqladmin.googleapis.com",
    "pubsub.googleapis.com",
    "autoscaling.googleapis.com",
    "cloudapis.googleapis.com",
    "domains.googleapis.com"
  ])

  service = each.key
}
