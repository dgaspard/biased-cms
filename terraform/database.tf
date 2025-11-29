resource "google_sql_database_instance" "instance" {
  name             = "${var.environment}-db-instance-${random_id.db_name_suffix.hex}"
  region           = var.region
  database_version = "POSTGRES_15"

  depends_on = [google_service_networking_connection.private_vpc_connection]

  settings {
    tier = "db-g1-small" # Smallest tier for cost efficiency

    ip_configuration {
      ipv4_enabled    = false
      private_network = google_compute_network.vpc.id
    }
  }
  deletion_protection = false # Set to true for production
}

resource "random_id" "db_name_suffix" {
  byte_length = 4
}

resource "google_sql_database" "database" {
  name     = "strapi"
  instance = google_sql_database_instance.instance.name
}

resource "google_sql_user" "users" {
  name     = "strapi"
  instance = google_sql_database_instance.instance.name
  password = var.db_password
}
