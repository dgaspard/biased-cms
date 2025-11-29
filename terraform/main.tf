terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = ">= 4.0.0"
    }
    google-beta = {
      source  = "hashicorp/google-beta"
      version = ">= 4.0.0"
    }
  }
  # Backend configuration - Uncomment and configure after creating the bucket
  # backend "gcs" {
  #   bucket  = "YOUR_TERRAFORM_STATE_BUCKET"
  #   prefix  = "terraform/state"
  # }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

provider "google-beta" {
  project = var.project_id
  region  = var.region
}
