resource "google_service_account" "default" {
  account_id   = "gce-main"
  display_name = "GCE Main"
}

resource "google_compute_instance" "main" {
  name         = "main"
  machine_type = "e2-small"
  zone         = "${var.envs.region}-a"

  can_ip_forward = false
  # deletion_protection = true
  enable_display            = false
  allow_stopping_for_update = true

  labels = {
    "container-vm" = "cos-101-17162-127-57"
    "ec-src"       = "vm_add-tf"
  }

  boot_disk {
    mode = "READ_WRITE"

    initialize_params {
      image = "https://www.googleapis.com/compute/v1/projects/cos-cloud/global/images/cos-101-17162-127-57"
      size  = 10
      type  = "pd-balanced"
    }
  }

  network_interface {
    access_config {
      network_tier = "PREMIUM"
    }

    subnetwork = var.network.subId
  }

  scheduling {
    automatic_restart   = true
    on_host_maintenance = "MIGRATE"
    preemptible         = false
    provisioning_model  = "STANDARD"
  }

  metadata = {
    gce-container-declaration = <<-EOT
      spec:
        containers:
        - name: main
          image: gcr.io/specfy/main
          command:
          - node
          args:
          - pkgs/api/build/index.js
          stdin: false
          tty: false
        restartPolicy: Always
      # This container declaration format is not public API and may change without notice. Please
      # use gcloud command-line tool or Google Cloud Console to run Containers on Google Compute Engine.
    EOT
  }

  service_account {
    email = google_service_account.default.email
    scopes = [
      "https://www.googleapis.com/auth/cloud-platform"
    ]
  }

  shielded_instance_config {
    enable_integrity_monitoring = true
    enable_secure_boot          = false
    enable_vtpm                 = true
  }
}
