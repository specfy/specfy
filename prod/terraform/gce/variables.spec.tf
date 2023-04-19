variable "network" {
  type = object({
    id    = string
    subId = string
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