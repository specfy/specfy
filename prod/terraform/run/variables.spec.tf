variable "cloudbuild" {
  type = object({
    mainImage = string
  })
}

variable "sql" {
  type = object({
    url      = string
    user     = string
    instance = string
    hostname = string
  })
}
