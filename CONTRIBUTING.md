# Contributing to Saved Brain

Thank you for your interest in contributing! This document outlines how to work on the project.

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Setup

```bash
# Clone the repository
git clone https://github.com/manazoid4/saved-brain.git
cd saved-brain

# Install dependencies
npm install

# Start the development server
npm run dev
```

### Useful Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run lint     # Run TypeScript type checking
npm run db:setup # Initialize the database
npm run db:seed  # Seed demo data
```

## Development Workflow

### Branching

- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/*` - Feature branches
- `fix/*` - Bug fix branches

### Making Changes

1. Create a branch from `develop`:
   ```bash
   git checkout develop
   git checkout -b feature/my-new-feature
   ```

2. Make your changes and commit:
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

3. Push and open a Pull Request

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `style:` Formatting
- `refactor:` Code restructuring
- `test:` Adding tests
- `chore:` Maintenance

### Pull Request Process

1. Fill out the PR template
2. Ensure CI passes
3. Request review from maintainers
4. Address feedback

## Code Style

- TypeScript strict mode enabled
- Use ES modules (no require)
- Prefer `const` over `let`
- Use meaningful variable names
- Comment complex logic

## Testing

Before submitting:

```bash
# Type check
npm run lint

# Build
npm run build
```

## Project Structure

```
saved-brain/
├── app/              # Next.js app directory
│   ├── api/          # API routes
│   ├── page.tsx      # Home page
│   └── layout.tsx   # Root layout
├── components/       # React components
├── lib/             # Utilities
├── scripts/         # Build/utility scripts
└── public/          # Static assets
```

## Questions?

Open an issue for bugs, feature requests, or questions. We'll respond as soon as possible.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.