env "local_main" {
  src = "./schema.hcl"
  url = "postgres://postgres:postgres@localhost:5432/postgres?sslmode=disable"
  schemas = ["public"]
}
