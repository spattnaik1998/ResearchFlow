# Contributing to ResearchFlow

Thank you for your interest in contributing! This document outlines the process and guidelines for contributing to ResearchFlow.

## Getting Started

1. **Fork the Repository**: Create a personal fork of the repository
2. **Clone Your Fork**: `git clone https://github.com/YOUR_USERNAME/claude-autobuild-voicesearch.git`
3. **Install Dependencies**: `npm install`
4. **Create a Branch**: Follow the branching strategy below

## Development Setup

### Environment Variables

Copy `.env.example` to `.env.local` and fill in your API keys:

```bash
cp .env.example .env.local
```

Required keys:
- `OPENAI_API_KEY` - OpenAI API key for summarization
- `SERPER_API_KEY` - Serper API key for search
- `ELEVENLABS_API_KEY` - ElevenLabs API key for TTS
- `SUPABASE_URL` - Supabase project URL (optional)
- `SUPABASE_SERVICE_KEY` - Supabase service role key (optional)

### Running Locally

```bash
npm run dev
# Open http://localhost:3000
```

### Testing

```bash
npm run test          # Run tests
npm run lint          # Run linter
npx tsc --noEmit      # Check types
npm run build         # Build for production
```

## Branching Strategy

Create branches following this naming convention:

- **Features**: `feature/short-description` (e.g., `feature/add-audio-controls`)
- **Bugfixes**: `fix/short-description` (e.g., `fix/audio-seek-bar`)
- **Chores**: `chore/short-description` (e.g., `chore/update-dependencies`)
- **Documentation**: `docs/short-description` (e.g., `docs/add-deployment-guide`)

## Commit Messages

Follow Conventional Commits format:

```
<type>(<scope>): <short summary>

<detailed description if needed>

Closes #<issue-number>
```

**Types**: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`

**Example**:
```
feat(components): add audio visualizer to player

Implements a waveform visualization for the audio player component.
Displays real-time frequency data during playback.

Closes #42
```

## Pull Request Process

1. **Create a Feature Branch**
   ```bash
   git checkout -b feature/your-feature
   ```

2. **Make Your Changes**
   - Keep changes focused and atomic
   - Write clear, self-documenting code
   - Add comments only where logic isn't obvious

3. **Test Your Changes**
   ```bash
   npm run lint
   npm run test
   npm run build
   ```

4. **Commit Your Work**
   ```bash
   git add .
   git commit -m "feat(scope): your message"
   ```

5. **Push and Open a PR**
   ```bash
   git push origin feature/your-feature
   ```

6. **PR Template**
   ```
   ## Description
   Brief description of changes

   ## Related Issues
   Closes #123

   ## Testing
   How to test the changes

   ## Checklist
   - [ ] Tests pass locally
   - [ ] Linter passes
   - [ ] Build succeeds
   - [ ] Documentation updated (if applicable)
   ```

## Code Style

### JavaScript/TypeScript

- Use `const` by default, `let` when needed
- Use async/await instead of .then()
- Add type annotations for function parameters and returns
- Keep functions small and focused

### React Components

- Use functional components with hooks
- Export components from dedicated files
- Use descriptive prop names
- Add JSDoc comments for complex components

### CSS/Tailwind

- Use Tailwind utilities over custom CSS when possible
- Follow mobile-first approach
- Group related utilities
- Use CSS variables for design tokens

## Security Guidelines

1. **Never commit secrets** (.env files, API keys, credentials)
2. **Validate user input** at system boundaries
3. **Sanitize outputs** to prevent XSS
4. **Use environment variables** for sensitive configuration
5. **Report security vulnerabilities** privately via SECURITY.md

## Documentation

- Update `README.md` for user-facing changes
- Add JSDoc comments for complex functions
- Include examples for new features
- Update `.env.example` for new environment variables

## Review Process

- All PRs require at least one approval
- CI/CD checks must pass (lint, build, tests, security audit)
- Maintainers will review code quality, security, and alignment
- Address feedback promptly

## What We Look For

✅ **Good Contributions**
- Clear, focused changes
- Well-tested code
- Good error handling
- Performance-conscious
- Accessible (WCAG AA compliance)

❌ **We May Reject**
- Breaking changes without discussion
- Unrelated changes in single PR
- Missing tests
- Security vulnerabilities
- Poor code quality

## Questions?

- Open a discussion in GitHub Discussions
- Check existing issues before creating new ones
- Ask in PR comments if unclear about feedback

## Recognition

Contributors are recognized in:
- [CONTRIBUTORS.md](CONTRIBUTORS.md) file
- GitHub's contributors page
- Release notes for significant contributions

Thank you for making ResearchFlow better! 🎉
