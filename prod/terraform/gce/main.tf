resource "google_compute_address" "main" {
  name         = "main-static-ip-vm"
  address_type = "EXTERNAL"
  region       = var.envs.region
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
  tags = ["allow-http"]

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
      nat_ip = google_compute_address.main.address
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
          env:
          - name: "DATABASE_URL"
            value: "${var.sql.url}"
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

# # to register web-server's ip address in DNS
# resource "google_dns_record_set" "default" {
#   name         = "specfy.io."
#   managed_zone = "specfy-io"
#   type         = "A"
#   ttl          = 300
#   rrdatas = [
#     google_compute_address.main.address
#   ]
# }

resource "google_compute_instance_group" "main" {
  name        = "main-vm"
  description = "Instance group"
  zone = "${var.envs.region}-a"

  instances = [
    google_compute_instance.main.id,
  ]

  named_port {
    name = "http"
    port = "8080"
  }
}

resource "google_compute_health_check" "main" {
  name         = "main-health"
  check_interval_sec = 5
  healthy_threshold  = 2


  http_health_check {
    port               = 80
    port_specification = "USE_FIXED_PORT"
    proxy_header       = "NONE"
    request_path       = "/0/"
  }
}

resource "google_compute_global_address" "main" {
  name       = "lb-ipv4-1"
  ip_version = "IPV4"
}

resource "google_compute_backend_service" "main" {
  name      = "main"
  port_name = "http"
  protocol  = "HTTP"

  health_checks = [
    google_compute_health_check.main.id,
  ]

  backend {
    group = google_compute_instance_group.main.id
  }
}

resource "google_compute_url_map" "main" {
  name            = "web-map-http"
  default_service = google_compute_backend_service.main.id
}

resource "google_compute_target_http_proxy" "main" {
  name    = "http-lb-proxy"
  url_map = google_compute_url_map.main.id
}

resource "google_compute_global_forwarding_rule" "main" {
  name                  = "http-content-rule"
  ip_protocol           = "TCP"
  load_balancing_scheme = "EXTERNAL_MANAGED"
  port_range            = "80-80"
  target                = google_compute_target_http_proxy.main.id
  ip_address            = google_compute_global_address.main.id
}
