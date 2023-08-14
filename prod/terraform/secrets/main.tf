locals {
  secrets = toset([
    "DB_PASSWORD",
    "PASSWORD_SALT",
    "COOKIE_SECRET",
    "GITHUB_CLIENT_APPID",
    "GITHUB_CLIENT_ID",
    "GITHUB_CLIENT_SECRET",
    "GITHUB_CLIENT_PKEY",
    "GITHUB_WEBHOOKS_SECRET",
    "RESEND_KEY",
    "STRIPE_KEY",
    "STRIPE_WEBHOOKS_SECRET",
    "JWT_SECRET"
  ])
}

resource "google_secret_manager_secret" "main" {
  for_each = local.secrets

  secret_id = each.value

  replication {
    automatic = true
  }
}


# resource "google_secret_manager_secret_version" "main" {
#   for_each = local.secrets

#   secret = google_secret_manager_secret.main[each.value].id
#   secret_data = "-" // empty data because
# }
