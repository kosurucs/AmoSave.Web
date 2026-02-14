# Copilot Execution Logs

This folder stores implementation logs for Copilot interactions, instruction execution, and outcomes.

## Structure

```text
.github/logs/
  README.md
  templates/
    copilot-session-log-template.md
  sessions/
    YYYY-MM-DD-<short-topic>.md
```

## What to Log
For each working session, capture:
- User request summary
- Key instructions executed
- Actions taken (files changed / commands run)
- Results and outcomes
- Open issues or follow-up tasks

## Rules
- One markdown file per session in `.github/logs/sessions/`.
- Use UTC date in filename.
- Do not log secrets, tokens, or private credentials.
- Keep logs concise and factual.
