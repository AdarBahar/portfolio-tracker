## Project Context Setup

Before implementing this task, please read the following files for full project context:

1. **`.augment/memory-log.md`** - Comprehensive development patterns, coding preferences, and architectural decisions
2. **`.augment/dev-rules.md`** - Development rules and conventions
3. **`.augment/project-brief.md`** - Project overview and context
4. **`architecture.md`** - System architecture documentation

## Critical Context Points

- **Deployment Architecture**: All K8s deployments are managed in the separate `cloud-apps-deployment` repository, NOT in this repo
- **JSON Logging Status**: Only k8s-psc environment uses JSON logging currently (intentional)
- **Code Style**: No comments in code, use descriptive method names instead
- **DTO Conventions**: Use "Wrapper" suffix with "Dedicated" prefix for DTOs
- **Spring Patterns**: Prefer Spring beans over static access for better testability
- **Testing**: Use mockito-inline for static method mocking, create enum validation tests for SQL queries

## Task Implementation

You are implementing the following plan:
{{TASK_PLAN}}

Follow the established patterns documented in the context files above. Suggest any helper functions, logging patterns, or edge-case handling as you go, ensuring they align with the documented preferences and architectural decisions.
