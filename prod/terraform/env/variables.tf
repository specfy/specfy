variable "envs" {
  type = object({
    env            = string
    project        = string
    region         = string
    billingAccount = string
    dns = object({
      enabled = bool
    })
    dns = object({
      machine = string
    })
  })
}

// From CLI
variable "docker_image_version" {
  type = string
}
