resource "google_service_account" "default" {
  account_id   = "gce-main"
  display_name = "GCE Main"
}

locals {
  spec = {
    spec = {
      containers = [{
        name = "main"
        image   = "gcr.io/specfy/main"
        command = ["node"]
        args    = ["pkgs/api/build/index.js"]
        stdin = false
        tty = false
      }]
      restartPolicy = true
    }
  }

  spec_as_yaml = yamlencode(local.spec)
}

resource "google_compute_instance" "main" {
  name         = "main"
  machine_type = "e2-micro"
  zone         = "${var.envs.region}-a"

  can_ip_forward      = false
  # deletion_protection = true
  enable_display      = false

  labels = {
    "container-vm" = "main"
  }

  boot_disk {
    initialize_params {
      image = "https://www.googleapis.com/compute/v1/projects/cos-cloud/global/images/cos-stable-105-17412-1-61"
    }
  }

  network_interface {

    access_config {
      network_tier = "PREMIUM"
    }

    subnetwork = var.network.subId
  }

  metadata = {
    gce-container-declaration = local.spec_as_yaml
  }

  service_account {
    email  = google_service_account.default.email
    scopes = ["cloud-platform",  "devstorage.read_only",
               "logging.write",
               "monitoring.write",
               "service.management.readonly",
               "servicecontrol",
               "trace.append"]
  }
}
