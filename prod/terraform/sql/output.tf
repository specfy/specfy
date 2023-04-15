output "sql" {
  value = {
    url    = "postgres://proxyuser:${google_sql_user.main.password}@${google_sql_database_instance.specfy.private_ip_address}/postgres"
  }
}
