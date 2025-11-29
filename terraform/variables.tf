variable "project_id" {
  description = "The GCP Project ID"
  type        = string
}

variable "region" {
  description = "The GCP Region"
  type        = string
  default     = "us-central1"
}

variable "environment" {
  description = "The environment name (e.g., production, staging)"
  type        = string
  default     = "production"
}

variable "db_password" {
  description = "Password for the database user"
  type        = string
  sensitive   = true
}

variable "jwt_secret" {
  description = "JWT Secret for Strapi"
  type        = string
  sensitive   = true
}

variable "admin_jwt_secret" {
  description = "Admin JWT Secret for Strapi"
  type        = string
  sensitive   = true
}

variable "app_keys" {
  description = "App Keys for Strapi (comma separated)"
  type        = string
  sensitive   = true
}

variable "api_token_salt" {
  description = "API Token Salt for Strapi"
  type        = string
  sensitive   = true
}

variable "transfer_token_salt" {
  description = "Transfer Token Salt for Strapi"
  type        = string
  sensitive   = true
}
