# AI Documentation & Coding Guidelines

This folder contains guidelines and best practices for writing quality code in this project.

## Contents

- [Code Style Guide](./code-style-guide.md) - Formatting, naming conventions, and style rules
- [Best Practices](./best-practices.md) - Architecture patterns and coding principles
- [TypeScript Guidelines](./typescript-guidelines.md) - TypeScript-specific conventions
- [shadcn-svelte Guidelines](./shadcn-svelte-guidelines.md) - UI component usage and installation
- [AI-Assisted Development](./ai-assisted-development.md) - Human-in-the-loop practices and effective collaboration

## Quick Reference

### Core Principles

1. **Clarity over cleverness** - Write code that's easy to understand
2. **Consistency** - Follow established patterns in the codebase
3. **Small, focused changes** - Keep PRs and commits manageable
4. **Test coverage** - Write tests for new functionality
6. **Human-in-the-loop** - AI assists, humans decide on architecture and approve changes
5. **Documentation** - Document complex logic and public APIs

**See [Best Practices](./best-practices.md) for detailed architecture and code quality standards.**

### UI Components (IMPORTANT)

**Before creating any UI component from scratch:**

1. Check if it exists in `src/lib/components/ui/`
2. Fetch `https://shadcn-svelte.com/llms.txt` to check available shadcn-svelte components
3. If available, install it: `npx shadcn-svelte@latest add <component-name>`
4. Only create custom components if no shadcn option exists

See [shadcn-svelte Guidelines](./shadcn-svelte-guidelines.md) for full details.
