# AmoSave.Web

## Planning Docs

- [Solution Architecture Plan](docs/plans/01-solution-architecture.md)
- [API to UI Coverage Matrix](docs/plans/02-api-ui-coverage-matrix.md)
- [Phased Roadmap](docs/plans/03-phased-roadmap.md)
- [React + TypeScript + Yarn + ESLint Setup](docs/plans/04-react-typescript-yarn-eslint-setup.md)
- [UI Reference from Sample Screens](docs/plans/05-ui-reference-from-sample.md)
- [NFR + Release Governance](docs/plans/06-nfr-release-governance.md)
- [Master Implementation Task Plan](docs/plans/07-master-implementation-task-plan.md)

## Execution Logs

- [Copilot Logs Root](.github/logs/README.md)
- [Session Logs](.github/logs/sessions/)

## Current Navigation UX

- Left main menus are now route-driven and persistent: `Market`, `Trade`, `Analyse`, `App Settings`, `Algo`, `Stragy Builder`.
- Clicking a left main menu loads contextual top submenus as tab menus in the main layout.
- App Settings tabs: `User Setting`, `System Settings`.
- Algo tabs: `Strgy Builder`, `Back testing`.
- Dedicated `Stragy Builder` main menu is also available for direct entry into strategy workflows.

### New Routes Added

- `/app/settings/user`
- `/app/settings/system`
- `/app/algo/strategy-builder`
- `/app/algo/back-testing`
- `/app/strategy-builder`