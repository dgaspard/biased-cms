resource "google_secret_manager_secret" "db_password" {
  secret_id = "db-password"
  replication {
    auto {}
  }
}

resource "google_secret_manager_secret_version" "db_password" {
  secret      = google_secret_manager_secret.db_password.id
  secret_data = var.db_password
}

resource "google_secret_manager_secret" "jwt_secret" {
  secret_id = "jwt-secret"
  replication {
    auto {}
  }
}

resource "google_secret_manager_secret_version" "jwt_secret" {
  secret      = google_secret_manager_secret.jwt_secret.id
  secret_data = var.jwt_secret
}

resource "google_secret_manager_secret" "admin_jwt_secret" {
  secret_id = "admin-jwt-secret"
  replication {
    auto {}
  }
}

resource "google_secret_manager_secret_version" "admin_jwt_secret" {
  secret      = google_secret_manager_secret.admin_jwt_secret.id
  secret_data = var.admin_jwt_secret
}

resource "google_secret_manager_secret" "app_keys" {
  secret_id = "app-keys"
  replication {
    auto {}
  }
}

resource "google_secret_manager_secret_version" "app_keys" {
  secret      = google_secret_manager_secret.app_keys.id
  secret_data = var.app_keys
}

resource "google_secret_manager_secret" "api_token_salt" {
  secret_id = "api-token-salt"
  replication {
    auto {}
  }
}

resource "google_secret_manager_secret_version" "api_token_salt" {
  secret      = google_secret_manager_secret.api_token_salt.id
  secret_data = var.api_token_salt
}

resource "google_secret_manager_secret" "transfer_token_salt" {
  secret_id = "transfer-token-salt"
  replication {
    auto {}
  }
}

resource "google_secret_manager_secret_version" "transfer_token_salt" {
  secret      = google_secret_manager_secret.transfer_token_salt.id
  secret_data = var.transfer_token_salt
}

# Grant Cloud Run Service Account access to secrets
# Note: Cloud Run uses the default compute service account by default.
# For production, create a dedicated service account.
data "google_compute_default_service_account" "default" {
}

resource "google_secret_manager_secret_iam_member" "secret_access" {
  for_each = toset([
    google_secret_manager_secret.db_password.id,
    google_secret_manager_secret.jwt_secret.id,
    google_secret_manager_secret.admin_jwt_secret.id,
    google_secret_manager_secret.app_keys.id,
    google_secret_manager_secret.api_token_salt.id,
    google_secret_manager_secret.transfer_token_salt.id,
  ])
  secret_id = each.value
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${data.google_compute_default_service_account.default.email}"
}
