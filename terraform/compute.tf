#
# Assumed dependencies (Service Accounts)
# IMPORTANT: These service accounts are required to run the containers 
# and grant specific permissions (like invoker roles)
#
resource "google_service_account" "frontend_sa" {
  account_id   = "${var.environment}-frontend-sa"
  display_name = "Frontend Cloud Run Service Account"
}

resource "google_service_account" "cms_sa" {
  account_id   = "${var.environment}-cms-sa"
  display_name = "CMS Cloud Run Service Account"
}

# --- 1. FRONTEND CLOUD RUN SERVICE (Public Access) ---

resource "google_cloud_run_v2_service" "frontend" {
  name     = "${var.environment}-frontend"
  location = var.region
  ingress  = "INGRESS_TRAFFIC_ALL"
  deletion_protection = false

  template {
    # ✅ BEST PRACTICE: Assign a dedicated service account to the running container
    service_account = google_service_account.frontend_sa.email

    containers {
      image = "us-central1-docker.pkg.dev/${var.project_id}/app/frontend:latest"
      
      # Optional: Explicitly define the default port (8080 for many web frameworks)
      ports {
        container_port = 8080 
      }
      
      resources {
        limits = {
          cpu    = "1000m"
          memory = "512Mi"
        }
      }
      env {
        name  = "NEXT_PUBLIC_API_URL"
        # The frontend calls the private CMS service via its URI
        value = google_cloud_run_v2_service.cms.uri
      }
    }
    scaling {
      min_instance_count = 0
      max_instance_count = 5
    }
    vpc_access {
      # The connector ID must be defined in the context where this file runs
      connector = google_vpc_access_connector.connector.id 
      egress    = "ALL_TRAFFIC"
    }
  }
}

# 1a. IAM Policy to make the Frontend publicly accessible
resource "google_cloud_run_v2_service_iam_member" "public_access" {
  # ✅ FIX: This resource name is now unique and grants public access to the FRONTEND
  name     = google_cloud_run_v2_service.frontend.name
  location = google_cloud_run_v2_service.frontend.location
  role     = "roles/run.invoker"
  member   = "allUsers"
}


# --- 2. CMS CLOUD RUN SERVICE (Private Access) ---

resource "google_cloud_run_v2_service" "cms" {
  name     = "${var.environment}-cms"
  location = var.region
  # ✅ FIX: Restrict ingress to internal traffic only for the backend
  ingress  = "INGRESS_TRAFFIC_ALL" 
  deletion_protection = false

  template {
    # ✅ FIX: Assign the dedicated CMS service account
    service_account = google_service_account.cms_sa.email 
    
    containers {
      image = "us-central1-docker.pkg.dev/${var.project_id}/app/cms:latest"
      
      # ✅ FIX: Use standard Cloud Run port 8080
      ports {
        container_port = 8080
      }
      
      resources {
        limits = {
          cpu    = "1000m"
          memory = "1024Mi"
        }
      }
      env {
        name  = "NODE_ENV"
        value = "production"
      }
      env {
        name  = "DATABASE_CLIENT"
        value = "postgres"
      }
      # Database connection env vars
      env {
        name  = "DATABASE_HOST"
        value = google_sql_database_instance.instance.private_ip_address
      }
      env {
        name  = "DATABASE_PORT"
        value = "5432"
      }
      env {
        name  = "DATABASE_SSL"
        value = "false"
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
      # Secret env vars (JWT, APP_KEYS, etc.)
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
      # egress is PRIVATE_RANGES_ONLY to talk to the SQL instance on its private IP
      egress    = "PRIVATE_RANGES_ONLY" 
    }
  }
}

# 2a. IAM Policy to allow the FRONTEND to call the private CMS
resource "google_cloud_run_v2_service_iam_member" "frontend_cms_invoker" {
  name     = google_cloud_run_v2_service.cms.name
  location = google_cloud_run_v2_service.cms.location
  role     = "roles/run.invoker"
  # ✅ FIX: Grant the frontend service account the ability to invoke the CMS service
  member   = "serviceAccount:${google_service_account.frontend_sa.email}"
}



# --- 3. DOMAIN MAPPING ---

resource "google_cloud_run_domain_mapping" "default" {
  location = var.region
  name     = "biasedframework.dev"

  metadata {
    namespace = var.project_id
  }

  spec {
    route_name = google_cloud_run_v2_service.frontend.name
  }
}