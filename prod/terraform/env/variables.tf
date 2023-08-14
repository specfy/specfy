variable "envs" {
  type = object({
    env     = string
    project = string
    region  = string
  })
}

// From CLI
variable "docker_image_version" {
  type    = string
}
