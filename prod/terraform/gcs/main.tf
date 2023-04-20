resource "google_storage_bucket" "specfy_front" {
  project       = var.envs.project
  name          = "${var.envs.project}-front-storage"
  location      = var.envs.region
  storage_class = "STANDARD"

  // will destroy everything inside if set to true
  force_destroy = false

  uniform_bucket_level_access = true


  website {
    main_page_suffix = "f3f912a/index.html"
    not_found_page   = "f3f912a/404.html"
  }
  cors {
    origin          = ["https://www.specfy.io"]
    method          = ["GET", "HEAD", "PUT", "POST", "DELETE"]
    response_header = ["*"]
    max_age_seconds = 3600
  }
}

resource "google_storage_bucket" "specfy_app" {
  project       = var.envs.project
  name          = "${var.envs.project}-app-storage"
  location      = var.envs.region
  storage_class = "STANDARD"

  // will destroy everything inside if set to true
  force_destroy = false

  uniform_bucket_level_access = true

  website {
    main_page_suffix = "f3f912a/index.html"
    not_found_page   = "f3f912a/index.html"
  }
  cors {
    origin          = ["https://app.specfy.io"]
    method          = ["GET", "HEAD", "PUT", "POST", "DELETE"]
    response_header = ["*"]
    max_age_seconds = 3600
  }
}
