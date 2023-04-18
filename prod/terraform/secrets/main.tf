resource "google_secret_manager_secret" "database_url" {
  secret_id = "database_url"

  replication {
    automatic = true
  }
}
