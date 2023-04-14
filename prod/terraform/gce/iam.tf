locals {
  roles = [
    "roles/storage.objectViewer",
    "roles/compute.instanceAdmin.v1",
    "roles/compute.networkAdmin"
  ]
}

resource "google_service_account" "default" {
  account_id   = "gce-main"
  display_name = "GCE Main"
}

resource "google_project_iam_member" "default" {
  count = length(local.roles)

  project = var.envs.project
  role    = local.roles[count.index]
  member  = "serviceAccount:${google_service_account.default.email}"
}
