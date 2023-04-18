resource "google_dns_managed_zone" "specfy_io" {
  description   = "DNS zone"
  dns_name      = "specfy.io."
  force_destroy = false
  name          = "specfy-io"
  project       = "specfy"
  visibility    = "public"
}
