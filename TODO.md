# 📝 Terraform Configuration TODOs

Missing information required to complete the Terraform infrastructure scripts.

- [ ] **GCP Project ID**
    - The blueprint uses `biased-dashboard-prod-123456`.
    - *Question:* What is the actual GCP Project ID?

- [ ] **Terraform State Bucket**
    - *Question:* What is the name of the GCS bucket where Terraform state will be stored? (e.g., `biased-terraform-state`)

- [ ] **IP Ranges**
    - [ ] **VPC Subnet CIDR**: What IP range should the main subnet use? (e.g., `10.0.0.0/24`)
    - [ ] **VPC Connector CIDR**: The Serverless VPC Access Connector requires a dedicated `/28` range. (e.g., `10.8.0.0/28`)

- [ ] **CMS Secrets**
    - *Question:* Aside from DB credentials, what other secrets does the CMS (e.g., Strapi) require? (e.g., `APP_KEYS`, `API_TOKEN_SALT`, `ADMIN_JWT_SECRET`)
    - *Decision:* Should Terraform generate these?

- [ ] **Artifact Registry**
    - The blueprint uses `.../app/frontend`.
    - *Question:* Is the Artifact Registry repository name literally `app`, or something else?

- [ ] **Frontend Config**
    - *Question:* Does the Next.js frontend need the CMS API URL injected as an environment variable (e.g., `NEXT_PUBLIC_API_URL`)?

- [ ] **Custom Domains**
    - *Question:* Do you need Terraform to configure custom domain mappings, or will you use the default `*.run.app` URLs for now?