resource "google_compute_network" "private_net" {
  project                 = var.envs.project
  name                    = "${var.envs.project}-network"
  auto_create_subnetworks = false

  lifecycle {
    prevent_destroy = true
  }
}

resource "google_compute_subnetwork" "private_subnet" {
  name          = "${var.envs.project}-subnetwork"
  ip_cidr_range = "10.2.0.0/16"
  region        = var.envs.region
  network       = google_compute_network.private_net.id
  secondary_ip_range {
    range_name    = "${var.envs.project}-subnetwork-secondary"
    ip_cidr_range = "192.168.10.0/24"
  }
}

resource "google_compute_global_address" "private_ip" {
  project       = var.envs.project
  name          = "${var.envs.project}-private-ip"
  purpose       = "VPC_PEERING"
  address_type  = "INTERNAL"
  prefix_length = 16
  network       = google_compute_network.private_net.id
}

resource "google_service_networking_connection" "private_vpc" {
  network                 = google_compute_network.private_net.id
  service                 = "servicenetworking.googleapis.com"
  reserved_peering_ranges = [google_compute_global_address.private_ip.name]
}

# Firewall to enable SSH through IAP
resource "google_compute_firewall" "allow-ssh-from-iap" {
  name    = "${var.envs.project}-allow-ssh-from-iap"
  network = google_compute_network.private_net.name

  allow {
    protocol = "tcp"
    ports    = ["22"]
  }

  # Range of the IAP proxies https://cloud.google.com/iap/docs/using-tcp-forwarding
  source_ranges = ["35.235.240.0/20"]
}

# Firewall to enable SSH through IAP
resource "google_compute_firewall" "allow-http" {
  name    = "${var.envs.project}-allow-http"
  network = google_compute_network.private_net.name

  allow {
    protocol = "tcp"
    ports    = ["80", "443"]
  }

  # Range of the IAP proxies https://cloud.google.com/iap/docs/using-tcp-forwarding
  source_ranges = ["0.0.0.0/0"]
  target_tags   = ["allow-http"]
}

