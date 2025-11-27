# ⚙️ Platform Configuration Blueprint: GCP & Terraform

This document provides the specific technical configuration and deployment steps for the initial **production** BIASED Dashboard environment, leveraging GCP's serverless stack via Terraform.

## 1. Environment Details

| Setting | Value | Notes |
| :--- | :--- | :--- |
| **Environment Name** | **production** | Primary environment for public traffic. |
| **GCP Project ID** | `biased-dashboard-prod-123456` | Example ID (to be replaced). |
| **GCP Region** | `us-central1` | Primary deployment region (low cost, central US). |
| **Terraform Workspace** | `prod` | Matches the environment name for state management. |

---

## 2. Infrastructure as Code (Terraform Setup)

### A. Terraform Providers & Backend
* **Providers:** `google`, `google-beta` (for V2 Cloud Run), `random` (for generated secrets).
* **Backend:** Must use **Cloud Storage** for remote state management (`gcs` backend).

### B. Core Resources Defined by Terraform
1.  **VPC Network:** A dedicated VPC and subnet.
2.  **VPC Access Connector:** Defines `google_vpc_access_connector` for private Cloud Run to Cloud SQL access.
3.  **Cloud SQL Instance:** Defines `google_sql_database_instance` and `google_sql_database`.
4.  **Secret Manager:** Defines `google_secret_manager_secret` for DB credentials.
5.  **Cloud Run Services:** Defines two separate `google_cloud_run_v2_service` resources.
6.  **IAM:** Defines roles to grant Cloud Run Service Accounts access to Secret Manager and the DB Proxy.

---

## 3. Service Configurations (Cloud Run)

### A. Frontend Service (Next.js)
| Setting | Value | Constraint / Source |
| :--- | :--- | :--- |
| **Container Image** | `us-central1-docker.pkg.dev/{{PROJECT_ID}}/app/frontend:latest` | Stored in **Artifact Registry**. |
| **CPU/Memory** | 1 CPU / 512 MiB | Low baseline for fast cold start. |
| **Scaling (Min/Max)** | **`Min: 0`** / `Max: 5` | **MANDATORY Cost Constraint (Scale-to-Zero).** |
| **VPC Connector** | Connector created in Section 2.B.2 | Required for future backend service integration or proxy if needed. |

### B. CMS Service (Headless CMS - e.g., Strapi)
| Setting | Value | Constraint / Source |
| :--- | :--- | :--- |
| **Container Image** | `us-central1-docker.pkg.dev/{{PROJECT_ID}}/app/cms:latest` | Stored in **Artifact Registry**. |
| **CPU/Memory** | 1 CPU / 1 GiB | Slightly higher capacity due to Node.js backend/admin console overhead. |
| **Scaling (Min/Max)** | **`Min: 0`** / `Max: 3` | **MANDATORY Cost Constraint (Scale-to-Zero).** |
| **VPC Connector** | Connector created in Section 2.B.2 | **MANDATORY** for secure, private access to Cloud SQL. |

---

## 4. Data Service Configurations (Cloud SQL - PostgreSQL)

### A. PostgreSQL Instance
| Setting | Value | Constraint / Source |
| :--- | :--- | :--- |
| **Instance Tier** | **`db-g1-small`** | **MANDATORY Cost Constraint** (covered by startup credits). |
| **Storage Capacity** | 10 GB | Minimum viable size. |
| **Networking** | **Private IP Only** | **MANDATORY Security Constraint.** |
| **Database Name** | `cms_database` | Dedicated database for the CMS. |
| **DB Credentials** | Stored in **Secret Manager** | Security requirement. |

---

## 5. Deployment Pipeline (Cloud Build)

### A. Core CI/CD Steps
1.  **Lint/Test:** Run unit and integration tests (Frontend and CMS).
2.  **Build Images:** Use a Cloud Build step to execute `docker build` for both projects.
3.  **Push Images:** Use a Cloud Build step to push images to **Artifact Registry**.
4.  **Cloud Run Deploy:** Use the Cloud Build service to deploy the new image versions to the respective Cloud Run services, ensuring zero downtime via traffic splitting.

### B. Trigger Details
| Trigger | Configuration | Branch |
| :--- | :--- | :--- |
| **Main CI/CD Trigger** | Automated on `git push` | `main` branch (for production) |
| **Terraform Drift Check** | Scheduled nightly check | Compares deployed state to code in main. |