resource "google_compute_network" "private_net" {
  project                 = var.envs.project
  name                    = "${var.envs.project}-network"
  auto_create_subnetworks = "false"

  lifecycle {
    prevent_destroy = true
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
