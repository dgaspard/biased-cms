# Biased CMS

A full-stack application featuring a Strapi CMS backend, Next.js frontend, and infrastructure deployed on Google Cloud Platform (GCP).

## 📁 Project Structure

```
biased-cms/
├── cms/                    # Strapi CMS backend
│   ├── config/            # Strapi configuration
│   │   ├── env/          # Environment-specific configs
│   │   ├── database.ts   # Database configuration
│   │   └── server.ts     # Server configuration
│   ├── src/              # API routes, content types, etc.
│   ├── Dockerfile        # Multi-stage Docker build
│   └── package.json
├── frontend/              # Next.js frontend application
│   ├── app/              # Next.js 13+ app directory
│   ├── public/           # Static assets
│   ├── Dockerfile        # Multi-stage Docker build
│   └── package.json
├── terraform/             # Infrastructure as Code
│   ├── main.tf           # Main Terraform configuration
│   ├── compute.tf        # Cloud Run services
│   ├── database.tf       # Cloud SQL configuration
│   ├── network.tf        # VPC and networking
│   ├── security.tf       # Secrets and IAM
│   └── variables.tf      # Terraform variables
├── biased/                # BIASED framework resources
└── docker-compose.yml     # Local development environment
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 20.x or higher
- **Docker** and Docker Compose
- **Google Cloud SDK** (for deployment)
- **Terraform** 1.0+ (for infrastructure)

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd biased-cms
   ```

2. **Set up environment variables**
   ```bash
   # CMS environment
   cp cms/.env.example cms/.env
   # Edit cms/.env with your local configuration
   ```

3. **Start with Docker Compose**
   ```bash
   docker-compose up
   ```

   This will start:
   - **Frontend**: http://localhost:3000
   - **CMS**: http://localhost:1337
   - **CMS Admin**: http://localhost:1337/admin
   - **PostgreSQL**: localhost:5432

4. **Create your first admin user**
   - Navigate to http://localhost:1337/admin
   - Fill in the admin registration form

### Manual Setup (without Docker)

#### CMS Setup

```bash
cd cms
npm install
cp .env.example .env
# Edit .env with your configuration
npm run develop
```

#### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

## 🌐 Deployment to GCP

### Prerequisites

1. **GCP Project** with billing enabled
2. **Authenticated gcloud CLI**
   ```bash
   gcloud auth login
   gcloud config set project YOUR_PROJECT_ID
   ```

3. **Enable required APIs**
   ```bash
   gcloud services enable run.googleapis.com
   gcloud services enable sql-component.googleapis.com
   gcloud services enable vpcaccess.googleapis.com
   gcloud services enable secretmanager.googleapis.com
   gcloud services enable artifactregistry.googleapis.com
   ```

4. **Create Artifact Registry repository**
   ```bash
   gcloud artifacts repositories create app \
     --repository-format=docker \
     --location=us-central1
   ```

### Deployment Steps

1. **Configure Terraform variables**
   ```bash
   cd terraform
   cp terraform.tfvars.example terraform.tfvars
   # Edit terraform.tfvars with your values
   ```

   Required variables:
   - `project_id`: Your GCP project ID
   - `region`: GCP region (default: us-central1)
   - `db_password`: Database password
   - `jwt_secret`: JWT secret for Strapi
   - `admin_jwt_secret`: Admin JWT secret
   - `app_keys`: Comma-separated app keys
   - `api_token_salt`: API token salt
   - `transfer_token_salt`: Transfer token salt

2. **Build and push Docker images**
   ```bash
   # Build CMS image
   docker build --platform linux/amd64 --provenance=false \
     -t us-central1-docker.pkg.dev/YOUR_PROJECT_ID/app/cms:latest ./cms
   docker push us-central1-docker.pkg.dev/YOUR_PROJECT_ID/app/cms:latest

   # Build Frontend image
   docker build --platform linux/amd64 --provenance=false \
     -t us-central1-docker.pkg.dev/YOUR_PROJECT_ID/app/frontend:latest ./frontend
   docker push us-central1-docker.pkg.dev/YOUR_PROJECT_ID/app/frontend:latest
   ```

3. **Deploy infrastructure**
   ```bash
   cd terraform
   terraform init
   terraform plan
   terraform apply
   ```

4. **Access your application**
   - **Frontend**: https://biasedframework.dev (or your configured domain)
   - **CMS Admin**: https://production-cms-XXXXX.run.app/admin

### Updating the Application

```bash
# Rebuild and push images
docker build --platform linux/amd64 --provenance=false \
  -t us-central1-docker.pkg.dev/YOUR_PROJECT_ID/app/cms:latest ./cms
docker push us-central1-docker.pkg.dev/YOUR_PROJECT_ID/app/cms:latest

# Force Cloud Run to pull the latest image
gcloud run services update production-cms \
  --region=us-central1 \
  --image=us-central1-docker.pkg.dev/YOUR_PROJECT_ID/app/cms:latest
```

## 🏗️ Architecture

### Local Development
- **Frontend** (Next.js) → **CMS** (Strapi) → **PostgreSQL**
- All services run in Docker containers
- Hot-reload enabled for development

### Production (GCP)
- **Cloud Run** for frontend and CMS (serverless containers)
- **Cloud SQL** (PostgreSQL) for database
- **VPC Connector** for private networking
- **Secret Manager** for sensitive configuration
- **Artifact Registry** for Docker images
- **Cloud Domain Mapping** for custom domains

### Security
- CMS uses IAM authentication (public access with Strapi's built-in auth)
- Database credentials stored in Secret Manager
- SSL/TLS enabled for all connections
- Private IP for Cloud SQL

## 📝 Environment Variables

### CMS (.env)

```bash
# Database
DATABASE_CLIENT=postgres
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=strapi
DATABASE_USERNAME=strapi
DATABASE_PASSWORD=strapi
DATABASE_SSL=false

# Secrets (generate with: openssl rand -base64 32)
JWT_SECRET=your-jwt-secret
ADMIN_JWT_SECRET=your-admin-jwt-secret
APP_KEYS=key1,key2,key3,key4
API_TOKEN_SALT=your-api-token-salt
TRANSFER_TOKEN_SALT=your-transfer-token-salt

# Server
HOST=0.0.0.0
PORT=1337
NODE_ENV=development
```

### Frontend (.env.local)

```bash
NEXT_PUBLIC_API_URL=http://localhost:1337
```

## 🛠️ Common Tasks

### Generate Strapi Secrets

```bash
# Generate a random secret
openssl rand -base64 32

# Generate APP_KEYS (4 keys separated by commas)
echo "$(openssl rand -base64 32),$(openssl rand -base64 32),$(openssl rand -base64 32),$(openssl rand -base64 32)"
```

### Database Migrations

```bash
cd cms
npm run strapi generate
```

### View Logs (Production)

```bash
# CMS logs
gcloud run services logs read production-cms --region=us-central1 --limit=50

# Frontend logs
gcloud run services logs read production-frontend --region=us-central1 --limit=50
```

### Connect to Production Database

```bash
gcloud sql connect INSTANCE_NAME --user=strapi --database=strapi
```

## 🐛 Troubleshooting

### Admin Panel 404 Error
If you see a 404 error when accessing `/admin`, ensure the admin panel was built:
```bash
cd cms
npm run build
```

### Port Already in Use
```bash
# Kill process on port 1337
lsof -ti:1337 | xargs kill -9

# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Docker Build Issues
```bash
# Clear Docker cache
docker system prune -a

# Rebuild without cache
docker-compose build --no-cache
```

## 📚 Additional Resources

- [Strapi Documentation](https://docs.strapi.io)
- [Next.js Documentation](https://nextjs.org/docs)
- [Terraform GCP Provider](https://registry.terraform.io/providers/hashicorp/google/latest/docs)
- [Cloud Run Documentation](https://cloud.google.com/run/docs)

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test locally with Docker Compose
4. Submit a pull request

## 📄 License

[Add your license here]
