# Claude Design import — NorCal CARB Mobile Home

**Design project:** `cc9d0c92-c0bb-49ee-885e-dcb7841afb93`  
**File:** `NorCal CARB Mobile - Home.dc.html`  
**URL:** https://claude.ai/design/p/cc9d0c92-c0bb-49ee-885e-dcb7841afb93?file=NorCal+CARB+Mobile+-+Home.dc.html

## MCP import (preferred)

The official `claude_design` MCP requires a **design-scoped OAuth token** (not the default Claude login).

### In Cursor / Claude Code (interactive terminal)

```bash
claude mcp add --transport http claude_design https://api.anthropic.com/v1/design/mcp
claude mcp login claude_design
```

Or use `/design-login` in Claude Code after auth completes.

Then ask the agent:

> Import this project using claude_design MCP:  
> https://claude.ai/design/p/cc9d0c92-c0bb-49ee-885e-dcb7841afb93?file=NorCal+CARB+Mobile+-+Home.dc.html  
> Implement into `sites/norcalcarbmobile/templates/home.html`

### Cloud Agent limitation

Cursor Cloud Agents cannot complete `claude mcp login` (requires an interactive terminal). Authenticate locally, then either:

1. **Export ZIP** from Claude Design → Share → Download zip → commit `design/handoff/` to the repo, or  
2. Paste the `.dc.html` source into `design/import/NorCal CARB Mobile - Home.dc.html`

## Current implementation (interim)

Until MCP import succeeds, the homepage is implemented from:

- Live Squarespace content at norcalcarbmobile.com  
- Existing tokens in `src/css/styles.css` (Montserrat + Source Sans 3)  
- Template: `sites/norcalcarbmobile/templates/home.html`

Rebuild: `npm run build:norcal`

## After importing the design file

1. Replace or merge `templates/home.html` with the `.dc.html` markup (strip design-canvas wrapper if present).  
2. Map design tokens to existing CSS variables in `styles.css`.  
3. Re-run `npm run build:norcal` and preview on `:4321`.
