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
    "HUBSPOT_ACCESS_TOKEN",
    "HUBSPOT_SUBSCRIPTION_MARKETING_ID",
    "HUBSPOT_SUBSCRIPTION_TRANSACTIONAL_ID",
    "HUBSPOT_SUBSCRIPTION_SALES_ID",
    "RESEND_KEY",
    "STRIPE_KEY",
    "STRIPE_WEBHOOKS_SECRET",
    "JWT_SECRET",
    "DD_API_KEY",
    "OPENAI_KEY",
    "LOGSNAG_KEY",
    "SENTRY_DSN",
    "ELASTICSEARCH_HOST",
    "ELASTICSEARCH_PWD"
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
