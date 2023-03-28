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

  index "idx_users_email" {
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
    type = varchar(36)
    null = false
  }
  column "name" {
    type = varchar(36)
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
    type = varchar(15)
    null = false
  }
  column "org_id" {
    type = varchar(36)
    null = false
  }
  column "blob_id" {
    type = uuid
    null = false
  }

  column "name" {
    type = varchar(36)
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

  column "display" {
    type = json
    null = false
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

  index "idx_projects_orgid_slug" {
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
    type = varchar(15)
    null = false
  }
  column "org_id" {
    type = varchar(36)
    null = false
  }
  column "project_id" {
    type = varchar(15)
    null = false
  }
  column "blob_id" {
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

  index "idx_document_orgid_projectid" {
    columns = [
      column.org_id,
      column.project_id
    ]
  }
  index "idx_document_orgid_type_typeid" {
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
    type = varchar(15)
    null = false
  }
  column "org_id" {
    type = varchar(36)
    null = false
  }
  column "project_id" {
    type = varchar(15)
    null = false
  }
  column "blob_id" {
    type = uuid
    null = false
  }
  column "tech_id" {
    type = varchar(50)
    null = true
  }

  column "type" {
    type = varchar(25)
    null = false
  }
  column "type_id" {
    type = varchar(36)
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
    type = varchar(15)
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
    type = varchar(36)
    null = false
  }
  column "project_id" {
    type = varchar(15)
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
  index "idx_team_org_userid" {
    columns = [
      column.org_id,
      column.user_id
    ]
    where = "project_id IS NULL"
    unique = true
  }
  index "idx_team_org_userid_projectid" {
    columns = [
      column.org_id,
      column.user_id,
      column.project_id
    ]
    unique = true
  }
}



// ------------------------ Type Has Users
table "type_has_users" {
  schema = schema.public
  column "document_id" {
    type = varchar(15)
    null = true
  }
  column "revision_id" {
    type = varchar(15)
    null = true
  }
  column "policy_id" {
    type = varchar(15)
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

  index "idx_documentid_userid" {
    columns = [
      column.document_id,
      column.user_id,
    ]
    unique = true
  }
  index "idx_revisionid_userid" {
    columns = [
      column.revision_id,
      column.user_id,
    ]
    unique = true
  }
  index "idx_policyid_userid" {
    columns = [
      column.policy_id,
      column.user_id,
    ]
    unique = true
  }
}


// ------------------------ Revisions
table "revisions" {
  schema = schema.public

  column "id" {
    type = varchar(15)
    null = false
  }
  column "org_id" {
    type = varchar(36)
    null = false
  }
  column "project_id" {
    type = varchar(15)
    null = false
  }

  column "name" {
    type = varchar(250)
    null = false
  }
  column "description" {
    type = json
    null = false
  }
  column "blobs" {
    type = json
    null = false
  }
  column "locked" {
    type = boolean
    null = false
    default = false
  }
  column "status" {
    type = varchar(25)
    null = false
    default = "draft"
  }
  column "merged" {
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
  column "merged_at" {
    type    = timestamp(6)
    null    = true
  }
  column "closed_at" {
    type    = timestamp(6)
    null    = true
  }

  primary_key {
    columns = [column.id]
  }
}


// ------------------------ Blobs
table "blobs" {
  schema = schema.public

  column "id" {
    type = uuid
    null = false
  }

  column "org_id" {
    type = varchar(36)
    null = false
  }
  column "project_id" {
    type = varchar(15)
    null = false
  }

  column "type" {
    type = varchar(36)
    null = false
  }
  column "type_id" {
    type = varchar(36)
    null = false
  }
  column "parent_id" {
    type = uuid
    null = true
  }
  column "blob" {
    type = json
    null = true
  }
  column "created" {
    type = boolean
    null = false
    default = false
  }
  column "deleted" {
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
}


// ------------------------ Reviews
table "reviews" {
  schema = schema.public

  column "id" {
    type = bigint
    null = false
    identity {
      generated = ALWAYS
      start = 1472
      increment = 1
    }
  }

  column "org_id" {
    type = varchar(36)
    null = false
  }
  column "project_id" {
    type = varchar(15)
    null = false
  }
  column "revision_id" {
    type = varchar(15)
    null = false
  }
  column "user_id" {
    type = uuid
    null = false
  }
  column "comment_id" {
    type = bigint
    null = true
  }

  column "created_at" {
    type    = timestamp(6)
    default = sql("now()")
    null    = false
  }

  primary_key {
    columns = [column.id]
  }

  index "idx_reviews_orgid_projectid_revisionid" {
    columns = [
      column.org_id,
      column.project_id,
      column.revision_id,
    ]
  }
}


// ------------------------ Comments
table "comments" {
  schema = schema.public

  column "id" {
    type = bigint
    null = false
    identity {
      generated = ALWAYS
      start = 1472
      increment = 1
    }
  }

  column "org_id" {
    type = varchar(36)
    null = false
  }
  column "project_id" {
    type = varchar(15)
    null = false
  }
  column "revision_id" {
    type = varchar(15)
    null = false
  }
  column "user_id" {
    type = uuid
    null = false
  }

  column "content" {
    type = json
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

  index "idx_comments_orgid_projectid_revisionid" {
    columns = [
      column.org_id,
      column.project_id,
      column.revision_id,
    ]
  }
}


// ------------------------ Policies
table "policies" {
  schema = schema.public

  column "id" {
    type = varchar(15)
    null = false
  }

  column "org_id" {
    type = varchar(36)
    null = false
  }

  column "type" {
    type = varchar(36)
    null = false
  }
  column "name" {
    type = varchar(250)
    null = true
  }
  column "tech" {
    type = varchar(36)
    null = true
  }
  column "content" {
    type = json
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

  index "idx_policies_orgid_type" {
    columns = [
      column.org_id,
      column.type,
    ]
  }
}


// ------------------------ Activities
table "activities" {
  schema = schema.public

  column "id" {
    type = varchar(15)
    null = false
  }

  column "org_id" {
    type = varchar(36)
    null = false
  }
  column "project_id" {
    type = varchar(15)
    null = true
  }

  column "user_id" {
    type = uuid
    null = false
  }

  column "activity_group_id" {
    type = varchar(15)
    null = false
  }
  column "action" {
    type = varchar(25)
    null = false
  }

  column "target_user_id" {
    type = uuid
    null = true
  }
  column "target_component_id" {
    type = varchar(15)
    null = true
  }
  column "target_document_id" {
    type = varchar(15)
    null = true
  }
  column "target_revision_id" {
    type = varchar(15)
    null = true
  }
  column "target_policy_id" {
    type = varchar(15)
    null = true
  }

  column "created_at" {
    type    = timestamp(6)
    default = sql("now()")
    null    = false
  }

  primary_key {
    columns = [column.id]
  }

  index "idx_activities_projectid_group" {
    columns = [
      column.org_id,
      column.project_id,
      column.activity_group_id,
    ]
  }
}
