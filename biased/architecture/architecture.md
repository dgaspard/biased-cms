# Architecture & Behavior Design Notes: Foundation Layer

## Prompting Strategy

* **Context:** This foundational layer is a traditional web application (Next.js Frontend, Headless CMS) intended for content delivery and management, not a generative AI system.
* **Decision:** **N/A.** No LLM prompting is required at this layer. Future AI systems will integrate with the CMS/DB data source.
* **Consequences:** The system avoids the complexity of LLM governance and focuses on **System Reliability and Cost** metrics first.

---

## Retrieval Sources

* **Context:** Content retrieval must be fast, secure, and deterministic for the Next.js frontend and the CMS backend. The current architecture uses a relational database.
* **Decision:** Data access will be handled via:
    1.  **Next.js Frontend** calls the **Headless CMS API** (public HTTP/REST/GraphQL endpoint).
    2.  **Headless CMS** queries the **Cloud SQL (PostgreSQL)** database.
    3.  Static assets are retrieved directly from **Cloud Storage (GCS)**.
* **Consequences:** Ensures content consistency and speed. Requires configuring strict IAM permissions for the CMS container to access GCS.

---

## Safety Layers

* **Context:** The primary security risk is exposing the database and unauthorized access to application secrets.
* **Decision:**
    1.  **Database Access:** **Cloud SQL (PostgreSQL)** must be configured with **Private IP only**. This connection will be brokered by a **Serverless VPC Access Connector** to ensure Cloud Run containers only connect via Google's internal network. **Public IP access is forbidden.**
    2.  **Secret Management:** All critical application secrets (DB credentials, API keys) must be stored and accessed via **Google Cloud Secret Manager**.
* **Consequences:** Eliminates external attack surface on the database, enforces a robust **Security & Governance** posture from day one, and prevents secrets from being hardcoded or stored in environment files.

---

## Technical Constraints

* **Context:** The project has no existing business revenue, requiring the absolute lowest possible cost floor and highly scalable services.
* **Decision:**
    1.  **Compute:** **Cloud Run scale-to-zero (`min_instances = 0`)** is mandatory for both the Next.js Frontend and the Headless CMS containers to minimize idle costs.
    2.  **Database:** Must use the smallest possible managed database tier (**Cloud SQL `db-g1-small`**) to limit the fixed operational cost.
    3.  **IaC:** All infrastructure must be defined and managed by **Terraform**.
* **Consequences:** Optimizes the project for the BIASED **System Reliability and Cost** metric, allowing the generous free tier and startup credits to be maximized.

---

## Integration Points

* **Context:** How the application components and services interact during deployment and runtime.
* **Decision:** The system must integrate three primary services and one CI/CD component:
    1.  **Frontend → CMS API (Runtime)**
    2.  **CMS → Cloud SQL (Runtime, via VPC Connector)**
    3.  **Cloud Build → Artifact Registry (CI/CD)**
    4.  **Cloud Build → Cloud Run (Deployment)**
* **Consequences:** Enforces a clean separation of deployment