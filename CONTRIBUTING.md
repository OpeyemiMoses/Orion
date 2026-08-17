# Contributing to OrionX

Thank you for your interest in contributing to **OrionX**! We welcome contributions from developers, researchers, and DeFi builders.

---

## Development Setup

1. **Fork and Clone the Repository:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/Orion.git
   cd Orion
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Create Environment File:**
   ```bash
   cp .env.example .env
   ```

4. **Run Local Dev Server:**
   ```bash
   npm run dev
   ```

---

## Branching and Development Workflow

1. Create a feature branch from `main`:
   ```bash
   git checkout -b feat/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

2. Follow clean code and standard naming conventions:
   - Use React Hooks cleanly.
   - Keep components modular and isolated.
   - Wrap RPC queries with proper error handling.

3. Verify production build locally before opening a pull request:
   ```bash
   npm run build
   ```

---

## Commit Conventions

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` A new feature or module
- `fix:` A bug fix
- `docs:` Documentation updates
- `style:` Code style / CSS adjustments
- `refactor:` Code refactoring without functionality changes
- `test:` Adding or updating tests

---

## Submitting a Pull Request

1. Push your branch to your fork:
   ```bash
   git push origin feat/your-feature-name
   ```
2. Open a Pull Request against the `main` branch of `https://github.com/OpeyemiMoses/Orion.git`.
3. Fill out the provided Pull Request template completely.
4. Ensure all CI/CD checks and builds pass.
