export interface Project {
    id: string;
    title: string;
    description: string;
    techStack: string[];
    liveUrl?: string;
    repoUrl?: string;
    imageUrl?: string;
    featured: boolean;
    order: number;
    createdAt?: string;
}

export interface Skill {
    id: string;
    name: string;
    category: string;
    level: string;
    iconUrl?: string;
    order: number;
}

export interface Certification {
    id: string;
    name: string;
    issuer: string;
    issueDate: string;
    expiryDate?: string;
    credentialUrl?: string;
    badgeUrl?: string;
}

export const fallbackProjects: Project[] = [
    {
        id: "fb-p1",
        title: "Personal Portfolio & Terminal Stack",
        description: "A developer-focused web portfolio featuring an interactive terminal CLI and visual dashboard. Fully dockerized and integrated with TypeORM and Neon Postgres.",
        techStack: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Express", "TypeORM", "PostgreSQL", "Docker"],
        repoUrl: "https://github.com/GeorgeDeveloperJ/portfolio",
        featured: true,
        order: 1
    },
    {
        id: "fb-p2",
        title: "Docker Stack Orchestrator",
        description: "Automated deployment pipeline and container configuration system featuring multi-stage builds, Nginx routing, and isolated network layers.",
        techStack: ["Docker", "Docker Compose", "Nginx", "Shell Scripting", "GitHub Actions"],
        repoUrl: "https://github.com/GeorgeDeveloperJ/portfolio",
        featured: true,
        order: 2
    },
    {
        id: "fb-p3",
        title: "Secure API Gateway & Backend",
        description: "Production-ready backend API featuring Helmet security, strict CORS policies, SSL verification, and Jest-based integration testing suite.",
        techStack: ["Node.js", "Express", "TypeScript", "Jest", "Supertest", "TypeORM"],
        repoUrl: "https://github.com/GeorgeDeveloperJ/portfolio",
        featured: false,
        order: 3
    }
];

export const fallbackSkills: Skill[] = [
    // Backend Skills
    { id: "fb-s1", name: "Node.js & Express", category: "Backend", level: "Expert", order: 1 },
    { id: "fb-s2", name: "TypeScript", category: "Backend", level: "Expert", order: 2 },
    { id: "fb-s3", name: "PostgreSQL & TypeORM", category: "Backend", level: "Intermediate", order: 3 },
    // Frontend Skills
    { id: "fb-s4", name: "React & Next.js", category: "Frontend", level: "Expert", order: 1 },
    { id: "fb-s5", name: "Tailwind CSS & CSS3", category: "Frontend", level: "Expert", order: 2 },
    // DevOps & Infrastructure Skills
    { id: "fb-s6", name: "Docker & Compose", category: "DevOps", level: "Expert", order: 1 },
    { id: "fb-s7", name: "Nginx & Reverse Proxies", category: "DevOps", level: "Intermediate", order: 2 },
    { id: "fb-s8", name: "CI/CD (GitHub Actions)", category: "DevOps", level: "Intermediate", order: 3 }
];

export const fallbackCertifications: Certification[] = [
    {
        id: "fb-c1",
        name: "AWS Certified Cloud Practitioner",
        issuer: "Amazon Web Services (AWS)",
        issueDate: "2026-03-15",
        credentialUrl: "https://aws.amazon.com"
    },
    {
        id: "fb-c2",
        name: "Docker Certified Associate (Simulated)",
        issuer: "Docker",
        issueDate: "2026-05-10"
    }
];
