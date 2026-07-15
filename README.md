# 💻 Full-Stack Personal Portfolio

A professional, production-ready, full-stack personal portfolio application designed to showcase software engineering projects, skills, certifications, and professional achievements. 

Built with a modern web architecture, this project features a containerized multi-tier setup, automated infrastructure provisioning, and robust CI/CD pipelines.

---

## 🚀 Key Features

*   **Dynamic Project Showcase**: Interactive projects dashboard with filtering, tagging, and search capabilities.
*   **Interactive Skills Matrix**: A visual breakdown of technical competencies, categories, and proficiency levels.
*   **Verified Certifications & Credentials**: Display and manage professional certifications with verification links.
*   **Secure Contact & Inquiry System**: Dynamic contact form with spam protection, rate-limiting, and automated email notifications.
*   **Admin Dashboard**: Protected administration panel to create, update, and delete projects, skills, and certifications in real-time.
*   **Responsive & Accessible UI**: Fluid glassmorphism UI with support for system dark/light mode, adhering to WCAG accessibility guidelines.
*   **Infrastructure-as-Code & Cloud Native**: Fully provisioned on AWS using Terraform and containerized via Docker.

---

## 🛠️ Tech Stack & Architecture

### High-Level Architecture

```mermaid
graph TD
    Client[Next.js Frontend / React] <-->|HTTPS / REST API| API[Node.js / Express Backend]
    API <-->|TypeORM| DB[(PostgreSQL Database)]
    API -->|Nodemailer / SMTP| Mail[Email Service]
    
    subgraph Local Development / Docker
        DockerCompose[Docker Compose Orchestration]
    end
    
    subgraph AWS Production Environment
        CF[Amazon CloudFront] --> S3[Amazon S3 Frontend]
        ALB[Application Load Balancer] --> ECS[Amazon ECS / Fargate]
        ECS --> RDS[(Amazon RDS PostgreSQL)]
    end
```

### Technology Breakdown

*   **Frontend**: 
    *   [![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
    *   [![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB)](https://reactjs.org/)
    *   [![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
    *   [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
*   **Backend**:
    *   [![Node.js](https://img.shields.io/badge/Node.js-43853D?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
    *   [![Express](https://img.shields.io/badge/Express-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
    *   [![TypeORM](https://img.shields.io/badge/TypeORM-FC8019?style=flat-square&logo=typeorm&logoColor=white)](https://typeorm.io/)
    *   [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
*   **DevOps & Infrastructure**:
    *   [![AWS](https://img.shields.io/badge/AWS-232F3E?style=flat-square&logo=amazon-aws&logoColor=white)](https://aws.amazon.com/)
    *   [![Terraform](https://img.shields.io/badge/Terraform-623CE4?style=flat-square&logo=terraform&logoColor=white)](https://www.terraform.io/)
    *   [![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white)](https://www.docker.com/)
    *   [![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=flat-square&logo=github-actions&logoColor=white)](https://github.com/features/actions)

---

## 📂 Project Structure

```text
portfolio/
├── .github/                  # CI/CD pipelines
│   └── workflows/
│       ├── frontend-deploy.yml
│       └── backend-deploy.yml
├── backend/                  # REST API server
│   ├── src/
│   │   ├── config/           # Database & server configs
│   │   ├── controllers/      # Route controllers
│   │   ├── entities/         # TypeORM database entities
│   │   ├── middleware/       # Auth, validation, & error handling
│   │   └── index.ts          # Server entry point
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
├── frontend/                 # Client application (Next.js)
│   ├── src/
│   │   ├── app/              # Next.js App Router (pages & layouts)
│   │   ├── components/       # Reusable React components (UI/Layout)
│   │   ├── hooks/            # Custom hooks
│   │   └── utils/            # Helper utilities
│   ├── Dockerfile
│   ├── package.json
│   └── tailwind.config.ts
├── infrastructure/           # Infrastructure-as-Code
│   ├── main.tf
│   ├── variables.tf
│   └── outputs.tf
├── docker-compose.yml        # Local multi-container orchestration
└── README.md
```

---

## 🛠️ Local Development & Setup

### Prerequisites

Ensure you have the following installed locally:
*   [Node.js](https://nodejs.org/) (v18.x or higher)
*   [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/)
*   [Terraform](https://www.terraform.io/) (for cloud deployment)

### 1. Clone the Repository

```bash
git clone https://github.com/georgesantanar/portfolio.git
cd portfolio
```

### 2. Environment Configuration

Create `.env` files in both the `frontend` and `backend` directories.

**Backend Configuration (`backend/.env`):**
```env
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_NAME=portfolio_db
JWT_SECRET=your_jwt_secret
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password
CONTACT_EMAIL=george.santana.devops@gmail.com
```

**Frontend Configuration (`frontend/.env.local`):**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 3. Spin Up Local Services (Docker Compose)

The easiest way to run the entire stack locally, including the PostgreSQL database, is via Docker Compose:

```bash
docker-compose up --build
```

This will start:
*   **Frontend Client**: `http://localhost:3000`
*   **Backend Server**: `http://localhost:5000`
*   **PostgreSQL Database**: `localhost:5432`

---

## 🚢 Deployment & CI/CD

This application is configured for a continuous deployment workflow utilizing AWS and GitHub Actions.

### Infrastructure Provisioning (Terraform)

The cloud environment is provisioned with high availability and security in mind:

1.  Initialize Terraform:
    ```bash
    cd infrastructure
    terraform init
    ```
2.  Plan the infrastructure details:
    ```bash
    terraform plan
    ```
3.  Deploy resources to AWS:
    ```bash
    terraform apply
    ```

### CI/CD Pipelines (GitHub Actions)

*   **Linting & Testing**: Runs automatically on every pull request to `main` and `develop`.
*   **Deployment Pipeline**:
    *   **Frontend**: Built and synced directly to an AWS S3 Bucket, invalidated via Amazon CloudFront CDN.
    *   **Backend**: Built as a Docker image, pushed to AWS ECR (Elastic Container Registry), and deployed to AWS ECS Fargate.

---

## 👤 Author & Contact

*   **Name**: George A. Santana R.
*   **Role**: DevOps & Full Stack Developer
*   **Email**: [georgeasantanar@gmail.com](mailto:georgeasantanar@gmail.com)
*   **GitHub**: [@georgedeveloperj](https://github.com/georgedeveloperj)
*   **LinkedIn**: [George A. Santana R.](https://linkedin.com/in/ghttps://www.linkedin.com/in/georgedeveloperj)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
