variable "envs" {
  type = object({
    env     = string
    project = string
    region  = string
  })
}
