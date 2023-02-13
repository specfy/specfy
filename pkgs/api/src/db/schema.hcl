schema "public" {}

// ------------------------ Users
table "users" {
  schema = schema.public
  column "id" {
    type = uuid
    null = false
  }
  column "name" {
    type = varchar(100)
    null = false
  }
  column "email" {
    type = varchar(250)
    null = false
  }
  column "created_at" {
    type    = timestamp(6)
    default = sql("now()")
    null    = false
  }
  column "updated_at" {
    type    = timestamp(6)
    default = sql("now()")
    null    = false
  }

  primary_key {
    columns = [column.id]
  }

  index "idx_email" {
    columns = [
      column.email
    ]
    unique = true
  }
}

// ------------------------ Organization
table "orgs" {
  schema = schema.public
  column "id" {
    type = varchar(35)
    null = false
  }
  column "name" {
    type = varchar(100)
    null = false
  }
  column "created_at" {
    type    = timestamp(6)
    default = sql("now()")
    null    = false
  }
  column "updated_at" {
    type    = timestamp(6)
    default = sql("now()")
    null    = false
  }

  primary_key {
    columns = [column.id]
  }
}

// ------------------------ Projects
table "projects" {
  schema = schema.public
  column "id" {
    type = uuid
    null = false
  }
  column "org_id" {
    type = varchar(35)
    null = false
  }
  column "name" {
    type = varchar(100)
    null = false
  }
  column "slug" {
    type = varchar(100)
    null = false
  }
  column "description" {
    type = json
    null = true
  }
  column "links" {
    type = json
    null = true
  }
  column "created_at" {
    type    = timestamp(6)
    default = sql("now()")
    null    = false
  }
  column "updated_at" {
    type    = timestamp(6)
    default = sql("now()")
    null    = false
  }

  primary_key {
    columns = [column.id]
  }

  index "idx_org_slug" {
    columns = [
      column.org_id,
      column.slug
    ]
    unique = true
  }
}


// ------------------------ Documents
table "documents" {
  schema = schema.public
  column "id" {
    type = uuid
    null = false
  }
  column "org_id" {
    type = varchar(35)
    null = false
  }
  column "project_id" {
    type = uuid
    null = false
  }
  column "type" {
    type = varchar(25)
    null = false
  }
  column "type_id" {
    type = int
    null = false
  }
  column "name" {
    type = varchar(100)
    null = false
  }
  column "slug" {
    type = varchar(100)
    null = false
  }
  column "tldr" {
    type = varchar(500)
    null = false
  }
  column "content" {
    type = json
    null = false
  }
  column "status" {
    type = varchar(25)
    null = false
    default = "draft"
  }
  column "locked" {
    type = boolean
    null = false
    default = false
  }

  column "created_at" {
    type    = timestamp(6)
    default = sql("now()")
    null    = false
  }
  column "updated_at" {
    type    = timestamp(6)
    default = sql("now()")
    null    = false
  }

  primary_key {
    columns = [column.id]
  }

  index "idx_org_pid" {
    columns = [
      column.org_id,
      column.project_id
    ]
  }
  index "idx_org_type_type_id" {
    columns = [
      column.org_id,
      column.type,
      column.type_id
    ]
    unique = true
  }
}

// ------------------------ Components
table "components" {
  schema = schema.public
  column "id" {
    type = uuid
    null = false
  }
  column "org_id" {
    type = varchar(35)
    null = false
  }
  column "project_id" {
    type = uuid
    null = false
  }

  column "type" {
    type = varchar(25)
    null = false
  }
  column "type_id" {
    type = uuid
    null = true
  }

  column "name" {
    type = varchar(100)
    null = false
  }
  column "slug" {
    type = varchar(100)
    null = false
  }
  column "description" {
    type = json
    null = true
  }
  column "tech" {
    type = json
    null = true
  }

  column "display" {
    type = json
    null = false
  }

  column "in_component" {
    type = uuid
    null = true
  }
  column "edges" {
    type = json
    null = true
  }

  column "created_at" {
    type    = timestamp(6)
    default = sql("now()")
    null    = false
  }
  column "updated_at" {
    type    = timestamp(6)
    default = sql("now()")
    null    = false
  }

  primary_key {
    columns = [column.id]
  }
}


// ------------------------ Team
table "perms" {
  schema = schema.public
  column "id" {
    type = uuid
    null = false
  }
  column "org_id" {
    type = varchar(35)
    null = false
  }
  column "project_id" {
    type = uuid
    null = true
  }

  column "user_id" {
    type = uuid
    null = false
  }

  column "role" {
    type = varchar(25)
    null = false
  }

  column "created_at" {
    type    = timestamp(6)
    default = sql("now()")
    null    = false
  }
  column "updated_at" {
    type    = timestamp(6)
    default = sql("now()")
    null    = false
  }

  primary_key {
    columns = [column.id]
  }
  index "idx_org_user_id_project_id" {
    columns = [
      column.org_id,
      column.user_id,
      column.project_id
    ]
    unique = true
  }
}



// ------------------------ Team
table "type_has_users" {
  schema = schema.public
  column "document_id" {
    type = uuid
    null = true
  }
  column "user_id" {
    type = uuid
    null = false
  }
  column "role" {
    type = varchar(25)
    null = false
  }

  column "created_at" {
    type    = timestamp(6)
    default = sql("now()")
    null    = false
  }

  index "document_id_user_id" {
    columns = [
      column.document_id,
      column.user_id,
    ]
    unique = true
  }
}
