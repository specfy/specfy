output "sql" {
  value = {
    user     = google_sql_user.main.name
    hostname = "postgres://${google_sql_user.main.name}:${google_sql_user.main.password}"
    instance = "${google_sql_database_instance.specfy.project}:${google_sql_database_instance.specfy.region}:${google_sql_database_instance.specfy.name}"
    url      = "postgres://${google_sql_user.main.name}:${google_sql_user.main.password}@${google_sql_database_instance.specfy.private_ip_address}/postgres"
  }
}
