# resource "google_dns_managed_zone" "specfy_io" {
#   count = var.envs.dns.enabled ? 1 : 0

#   description   = "DNS zone"
#   dns_name      = "specfy.io."
#   force_destroy = false
#   name          = "specfy-io"
#   project       = "specfy"
#   visibility    = "public"
# }

# Domain
# to create a DNS zone
# resource "google_dns_managed_zone" "specfy-io" {
#   count = var.envs.dns.enabled ? 1 : 0

#   name          = "specfy-io"
#   dns_name      = "specfy.io."
#   description   = "DNS zone"
#   force_destroy = "false"
# }
