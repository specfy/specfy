resource "google_compute_global_address" "custom_domains_49a4_ip" {
  address_type = "EXTERNAL"
  name         = "custom-domains-49a4-ip"
}

resource "google_compute_managed_ssl_certificate" "specfy_ssl" {
  name = "specfy-ssl"
  managed {
    domains = ["specfy.io.", "api.specfy.io.", "app.specfy.io.", "www.specfy.io."]
  }
}


// ---- HTTP to HTTPS Redirection
resource "google_compute_url_map" "specfy_frontend_redirect" {
  name        = "specfy-frontend-redirect"
  description = "Automatically generated HTTP to HTTPS redirect for the specfy-frontend forwarding rule"

  default_url_redirect {
    https_redirect         = true
    redirect_response_code = "MOVED_PERMANENTLY_DEFAULT"
    strip_query            = false
  }
}

resource "google_compute_target_http_proxy" "specfy_frontend_target_proxy" {
  name    = "specfy-frontend-target-proxy"
  url_map = google_compute_url_map.specfy_frontend_redirect.id
}

resource "google_compute_global_forwarding_rule" "specfy_frontend_forwarding_rule" {
  ip_address            = "34.120.249.219"
  ip_protocol           = "TCP"
  load_balancing_scheme = "EXTERNAL_MANAGED"
  name                  = "specfy-frontend-forwarding-rule"
  port_range            = "80-80"
  target                = google_compute_target_http_proxy.specfy_frontend_target_proxy.id
}


// -------- HTTPS Handling
// ---- Backends
// The receive a request and dispatch to the linked resource
resource "google_compute_backend_bucket" "backend_app" {
  name             = "backend-app"
  bucket_name      = "specfy-app-storage"
  enable_cdn       = true
  compression_mode = "DISABLED"

  cdn_policy {
    cache_mode         = "CACHE_ALL_STATIC"
    client_ttl         = 3600
    default_ttl        = 3600
    max_ttl            = 86400
    request_coalescing = true
  }
}

resource "google_compute_backend_bucket" "backend_front" {
  name             = "backend-front"
  bucket_name      = "specfy-front-storage"
  enable_cdn       = true
  compression_mode = "DISABLED"

  cdn_policy {
    cache_mode         = "CACHE_ALL_STATIC"
    client_ttl         = 3600
    default_ttl        = 3600
    max_ttl            = 86400
    request_coalescing = true
  }
}

resource "google_compute_backend_service" "custom_domains_app_specfy_io_main_49a4_be" {
  connection_draining_timeout_sec = 300
  load_balancing_scheme           = "EXTERNAL_MANAGED"
  name                            = "custom-domains-app-specfy-io-main-49a4-be"
  port_name                       = "http"
  protocol                        = "HTTP"
  session_affinity                = "NONE"
  timeout_sec                     = 30

  backend {
    balancing_mode               = "UTILIZATION"
    capacity_scaler              = 1
    group                        = "https://www.googleapis.com/compute/v1/projects/specfy/regions/us-central1/networkEndpointGroups/custom-domains-app-specfy-io-main-49a4-neg"
    max_connections              = 0
    max_connections_per_endpoint = 0
    max_connections_per_instance = 0
    max_rate                     = 0
    max_rate_per_endpoint        = 0
    max_rate_per_instance        = 0
    max_utilization              = 0
  }
}

resource "google_compute_url_map" "custom_domains_49a4" {
  default_service = google_compute_backend_bucket.backend_front.id
  name            = "custom-domains-49a4"

  host_rule {
    hosts        = ["api.specfy.io"]
    path_matcher = "app-specfy-io"
  }

  host_rule {
    hosts        = ["app.specfy.io"]
    path_matcher = "path-matcher-2"
  }

  host_rule {
    hosts        = ["www.specfy.io"]
    path_matcher = "path-matcher-1"
  }

  path_matcher {
    default_service = google_compute_backend_service.custom_domains_app_specfy_io_main_49a4_be.id
    name            = "app-specfy-io"
  }

  path_matcher {
    default_service = google_compute_backend_bucket.backend_front.id
    name            = "path-matcher-1"
  }

  path_matcher {
    default_service = google_compute_backend_bucket.backend_app.id
    name            = "path-matcher-2"
  }
}

resource "google_compute_target_https_proxy" "custom_domains_49a4_target_proxy" {
  name             = "custom-domains-49a4-target-proxy"
  quic_override    = "NONE"
  ssl_certificates = [google_compute_managed_ssl_certificate.specfy_ssl.id]
  url_map          = google_compute_url_map.custom_domains_49a4.id
}

resource "google_compute_global_forwarding_rule" "specfy_frontend" {
  name                  = "specfy-frontend"
  ip_address            = "34.120.249.219"
  ip_protocol           = "TCP"
  load_balancing_scheme = "EXTERNAL_MANAGED"
  port_range            = "443-443"
  target                = google_compute_target_https_proxy.custom_domains_49a4_target_proxy.id
}


