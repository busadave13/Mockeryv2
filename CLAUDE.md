# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Mockery v2 is a multi-agent software development framework that orchestrates specialized AI agents to handle complex development workflows. The system uses a structured approach with defined roles, responsibilities, and evidence-based validation protocols.

## Architecture

### Multi-Agent System

The framework operates through specialized agents, each with distinct responsibilities:

- **product-manager**: Translates requirements into user stories, conducts golden path testing, validates features from user perspective
- **project-architect**: Creates system designs, defines component interfaces, establishes dependency graphs, documents technology decisions
- **software-engineer**: Implements complete full-stack features that integrate frontend, backend, and data layers
- **e2e-test-engineer**: Performs comprehensive end-to-end testing with visual validation, accessibility checks, and cross-browser testing
- **evidence-auditor**: Reviews documentation for claims about functionality, ensures reproducible proof for all assertions
- **ml-engineer**: Designs and implements production-grade ML systems with proper feature engineering and evaluation
- **ux-designer**: Designs accessible user interfaces, ensures WCAG AA compliance, creates design systems

### Workflow Structure

The system follows a structured sprint-based approach:

```
.work/
├── foundation/
│   ├── product/              # User stories, acceptance criteria
│   ├── architecture/         # ARCHITECTURE.md, TECH-STACK.md, DEPENDENCIES.md
│   └── ux/                   # User flows, wireframes, design system
├── PRD/                      # Product requirements (read-only)
└── milestones/{YYYYMMDD-name}/
    └── sprint-XXX/
        ├── tasks/{task-id}/  # Individual task implementations
        └── validation-N/     # Test evidence and validation reports
```

### Key Architectural Principles

1. **Architecture First**: Always read ARCHITECTURE.md before implementation
2. **Evidence-Based**: All claims must be backed by reproducible proof
3. **Complete Integration**: Features must work end-to-end across all layers
4. **Document Deviations**: Any divergence from architecture must be explicitly documented in EVIDENCE.md
5. **Quality Gates**: No feature is complete without validation from both PM and test engineer

## Required Artifacts

### For Architecture Tasks
- **ARCHITECTURE.md**: Complete system design (no TBDs allowed)
- **TECH-STACK.md**: Technology decisions with rationale (separate file, mandatory)
- **DEPENDENCIES.md**: Dependency graph showing what can be built in parallel
- **INTERFACE-[feature].md**: Public contracts for each major component

### For Implementation Tasks
- **INTERFACE.md**: Defines how other components interact with your work
- **EVIDENCE.md**: Proves implementation is complete with test results and file lists
- **Working code**: Fully functional feature across all layers

### For Test Validation
- **E2E test results**: Playwright tests with screenshots (desktop and mobile)
- **Service validation**: Startup logs, health checks, endpoint verification
- **Accessibility audit**: WCAG AA compliance verification
- **Cross-browser results**: Testing on Chrome, Firefox, Safari

### For Product Validation
- **Golden path validation**: User journey walkthroughs with screenshots
- **pm-report.md**: Sign-off document in validation directory
- **User story verification**: Each acceptance criterion tested end-to-end

## Evidence Requirements

The framework enforces strict evidence standards. All claims require:

- Exact commands with complete paths (no shortcuts)
- Complete, unedited output (no truncation or summaries)
- Timestamps on all artifacts
- Step-by-step reproduction instructions
- Demonstrated error handling and edge cases

### Rejected Evidence Patterns
- "Works as expected" without showing actual output
- "Tests are passing" without complete test output
- Truncated output with "..." or "<omitted>"
- Missing timestamps
- Generic success claims without specific metrics
- No reproduction steps

## File Management

### Critical Rules
- Never leave temporary files in project root
- All evidence files go in `.work/milestones/*/evidence/`
- Test scripts belong in appropriate test directories
- Clean up or relocate all temporary files before task completion
- List EVERY modified/created file in EVIDENCE.md (used for git commits)

### First Sprint Infrastructure Setup
If package.json doesn't exist, the software-engineer must:
1. Create .gitignore IMMEDIATELY before installing packages
2. Initialize project structure per ARCHITECTURE.md
3. Install ALL dependencies
4. Configure complete environment
5. Write one passing E2E test to verify the stack

## Testing Philosophy

- **Unit/Integration tests**: Run during integration phase
- **E2E tests**: Playwright-based, run after integration complete
- **Visual validation**: Screenshots mandatory for all UI features
- **Service validation**: Required at milestone completion
- **Accessibility**: WCAG AA compliance is non-negotiable

## Quality Standards

### Code Quality
- Validate all inputs early
- Use try/catch for all async operations
- Return meaningful, actionable error messages
- Log errors with appropriate context
- Write descriptive variable and function names
- Add comments for complex logic

### Accessibility (WCAG AA)
- Semantic HTML elements
- ARIA labels where needed
- Keyboard navigation for all interactive elements
- Visible focus indicators
- Color contrast ≥ 4.5:1 for normal text
- Alt text for meaningful images
- Touch targets ≥ 44x44px

### Design Tokens
Use CSS custom properties for consistency:
- Colors, spacing, typography, border-radius
- Mobile-first responsive design
- Test breakpoints: 320px+, 768px+, 1024px+

## Git Workflow

- Developers do NOT commit directly
- Orchestrator creates isolated commits after validation
- EVIDENCE.md file lists are used to determine commit contents
- All deviations from architecture must be documented before commit

## Discovery Process

When starting vague requests (e.g., "build me a..."), the product manager generates 0-3 clarifying questions about:
- Target users and their needs
- Success metrics and KPIs
- MVP scope and priorities

This happens once at session start.

## Communication Standards

- Be specific about what was built
- Provide concrete evidence of completion
- Highlight any deviations or concerns
- Ask questions if architecture is unclear
- Never claim something works without proof
- Frame decisions in terms of user benefit

## Agent Invocation Context

Agents work in sequence:
1. **Product Manager**: Creates user stories from requirements
2. **Architect**: Designs complete system architecture with interfaces
3. **Software Engineer**: Implements full-stack features per architecture
4. **E2E Test Engineer**: Validates with comprehensive testing (after integration)
5. **Product Manager**: Conducts golden path validation and sign-off
6. **Evidence Auditor**: Can be invoked anytime to verify claims

## Success Metrics

- Features work completely end-to-end
- All tests pass (unit, integration, E2E)
- Complete documentation with reproducible evidence
- WCAG AA accessibility compliance
- No untracked files or architectural deviations undocumented
- Clean git status with organized file structure
