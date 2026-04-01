# MaxScore

> AI-powered face analysis and looksmaxxing recommendations platform

![MaxScore Demo](https://via.placeholder.com/800x400?text=MaxScore+Demo)

## Overview

MaxScore analyzes facial aesthetics using computer vision and AI, providing users with objective attractiveness scores and personalized improvement recommendations. The platform targets the growing "looksmaxxing" self-improvement community.

## Features

- **AI Face Analysis**: 468 facial landmarks analyzed using MediaPipe
- **Objective Scoring**: 1-10 scores across 6 key features (symmetry, jawline, eyes, nose, facial thirds, skin)
- **Personalized Suggestions**: LLM-generated improvement recommendations
- **AI Chat**: Ask follow-up questions about your results
- **Progress Tracking**: Compare scores over time (Pro)
- **Privacy First**: Images auto-deleted after 30 days

## Tech Stack

### Frontend
- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui + Radix UI**
- **Framer Motion**
- **TanStack Query**

### Backend
- **FastAPI** (Python)
- **MediaPipe** (Face Detection)
- **Claude API** (AI Suggestions)
- **Celery + Redis** (Background Jobs)

### Infrastructure
- **Vercel** (Frontend)
- **Railway** (API + Workers)
- **Neon** (PostgreSQL)
- **Cloudflare R2** (Image Storage)
- **Clerk** (Authentication)
- **Stripe** (Payments)

## Getting Started

### Prerequisites

- Node.js 20+
- Python 3.11+
- pnpm
- Docker (optional, for local services)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/maxscore.git
cd maxscore
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
# Edit .env.local with your API keys
```

4. Start local services (PostgreSQL, Redis):
```bash
cd infra/docker
docker-compose up -d postgres redis
```

5. Run database migrations:
```bash
cd packages/database
pnpm db:push
```

6. Start development servers:
```bash
# Terminal 1: Frontend
pnpm dev:web

# Terminal 2: Backend
pnpm dev:api
```

7. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
maxscore/
├── apps/
│   ├── web/                 # Next.js frontend
│   │   ├── app/            # App router pages
│   │   ├── components/     # React components
│   │   └── lib/           # Utilities
│   └── api/                # FastAPI backend
│       ├── app/
│       │   ├── routers/   # API endpoints
│       │   └── services/  # Business logic
│       └── tests/
├── packages/
│   ├── database/          # Prisma schema
│   └── shared/            # Shared types
├── infra/
│   └── docker/            # Docker configs
└── docs/                   # Documentation
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_URL` | Redis connection string |
| `CLERK_SECRET_KEY` | Clerk authentication |
| `ANTHROPIC_API_KEY` | Claude API for suggestions |
| `STRIPE_SECRET_KEY` | Stripe payments |
| `R2_*` | Cloudflare R2 storage |

See `.env.example` for all variables.

## Deployment

### Frontend (Vercel)

1. Connect your GitHub repo to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main

### Backend (Railway)

1. Create a new Railway project
2. Add PostgreSQL and Redis services
3. Deploy from GitHub
4. Set environment variables

### Database

```bash
cd packages/database
DATABASE_URL="your-production-url" npx prisma migrate deploy
```

## API Documentation

Once running, visit:
- API docs: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### Key Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/scans` | POST | Initiate new scan |
| `/api/v1/scans/{id}` | GET | Get scan results |
| `/api/v1/chat` | POST | Chat with AI |
| `/api/v1/users/quota` | GET | Check scan quota |

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `pnpm test`
5. Submit a pull request

## License

MIT License - see [LICENSE](LICENSE) for details.

## Support

- Issues: [GitHub Issues](https://github.com/yourusername/maxscore/issues)
- Email: support@maxscore.app

---

Built with love using Next.js, FastAPI, and Claude AI.
