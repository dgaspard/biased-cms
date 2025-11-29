resource "google_cloud_run_v2_service" "frontend" {
  name     = "${var.environment}-frontend"
  location = var.region
  ingress  = "INGRESS_TRAFFIC_ALL"

  template {
    containers {
      image = "us-central1-docker.pkg.dev/${var.project_id}/app/frontend:latest"
      resources {
        limits = {
          cpu    = "1000m"
          memory = "512Mi"
        }
      }
      env {
        name  = "NEXT_PUBLIC_API_URL"
        value = google_cloud_run_v2_service.cms.uri
      }
    }
    scaling {
      min_instance_count = 0
      max_instance_count = 5
    }
    vpc_access {
      connector = google_vpc_access_connector.connector.id
      egress    = "ALL_TRAFFIC"
    }
  }
}

resource "google_cloud_run_v2_service_iam_member" "public_access" {
  service  = google_cloud_run_v2_service.frontend.name
  location = google_cloud_run_v2_service.frontend.location
  role     = "roles/run.invoker"
  member   = "allUsers"
}

resource "google_cloud_run_v2_service" "cms" {
  name     = "${var.environment}-cms"
  location = var.region
  ingress  = "INGRESS_TRAFFIC_ALL"

  template {
    containers {
      image = "us-central1-docker.pkg.dev/${var.project_id}/app/cms:latest"
      resources {
        limits = {
          cpu    = "1000m"
          memory = "1024Mi"
        }
      }
      env {
        name  = "DATABASE_CLIENT"
        value = "postgres"
      }
      env {
        name  = "DATABASE_HOST"
        value = google_sql_database_instance.instance.private_ip_address
      }
      env {
        name  = "DATABASE_PORT"
        value = "5432"
      }
      env {
        name  = "DATABASE_NAME"
        value = google_sql_database.database.name
      }
      env {
        name  = "DATABASE_USERNAME"
        value = google_sql_user.users.name
      }
      env {
        name = "DATABASE_PASSWORD"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.db_password.secret_id
            version = "latest"
          }
        }
      }
      # Add other secrets similarly (JWT, Keys, etc.)
      env {
        name = "JWT_SECRET"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.jwt_secret.secret_id
            version = "latest"
          }
        }
      }
      env {
        name = "ADMIN_JWT_SECRET"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.admin_jwt_secret.secret_id
            version = "latest"
          }
        }
      }
      env {
        name = "APP_KEYS"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.app_keys.secret_id
            version = "latest"
          }
        }
      }
      env {
        name = "API_TOKEN_SALT"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.api_token_salt.secret_id
            version = "latest"
          }
        }
      }
      env {
        name = "TRANSFER_TOKEN_SALT"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.transfer_token_salt.secret_id
            version = "latest"
          }
        }
      }
    }
    scaling {
      min_instance_count = 0
      max_instance_count = 3
    }
    vpc_access {
      connector = google_vpc_access_connector.connector.id
      egress    = "PRIVATE_RANGES_ONLY"
    }
  }
}
