# 📬 Volontariapp — Outbox Runners

This repository centralizes all background workers responsible for the **Outbox Pattern** implementation within the Volontariapp ecosystem.

## 🏗 Architecture (Lean Mode)

To ensure maximum performance and minimal overhead, these runners are built in **Lean Mode**:
- **Pure Node.js**: No NestJS or heavy frameworks.
- **Async Processing**: Using RxJS for stream handling (if needed).
- **Direct Bridge**: Utilizing `@volontariapp/bridge` for high-performance DB interactions.
- **Health Checks**: Built-in startup verification using `@volontariapp/health-check`.

## 🛠 Command Center

We provide a central script to manage all runners at once.

```bash
./command.sh
```

### Key Features:
- **📦 Install All**: Synchronize dependencies across all projects.
- **🏗 Build All**: Compile TypeScript for all runners.
- **✨ Lint All**: Ensure code quality and consistency.
- **🚀 Run All**: Launch all runners in parallel for local development.
- **➕ Create Outbox**: Scaffold a new runner project in seconds.
- **🔄 Safe Rebase**: Safely sync your local branch with the main repository.

## 📁 Repository Structure

```text
outbox-runners/
├── outbox-user/     # Syncs User events
├── outbox-social/   # Syncs Social/Graph events
├── outbox-post/     # Syncs Post/Media events
├── outbox-event/    # Syncs Volunteering Event data
├── scripts/         # Scaffolding and maintenance tools
└── command.sh       # Main Command Center
```

## ➕ Adding a New Runner

Use the built-in scaffolding tool to create a new runner project with all best practices pre-configured:

1. Run `./command.sh` and select option **8 (Create Outbox)**.
2. Enter the name of your runner.
3. Follow the "Next Steps" displayed by the script (Install deps & config).

## 🚀 Deployment

Each push to the `main` branch automatically:
1. Validates build and linting.
2. Updates the corresponding submodule in the `deploy` repository.

---
**Volontariapp Engineering** — *Build fast, stay lean.*
