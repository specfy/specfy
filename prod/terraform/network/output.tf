output "network" {
  value = {
    id    = google_compute_network.private_net.id
    subId = google_compute_subnetwork.private_subnet.id
  }
}
