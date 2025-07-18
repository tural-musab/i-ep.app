// cursor: compare-structures
//
// Compare two proposed monorepo structures using the live project files:
//
// Structure A (Cursor AI’s full-detailed pattern):
// - apps/ (web, admin, docs, mobile)
// - packages/ (ui, shared, database, auth, tenant, eslint-config)
// - services/ (api, edge-functions, workers, cron-jobs)
// - tests/, infrastructure/, docs/, tools/, config/, database/, monitoring/, security/
//
// Structure B (ChatGPT’s professional SaaS model):
// - frontend/, backend/, libs/, infra/, config/, scripts/, supabase/
// - tests/, .github/workflows/, .env.example, package.json, pnpm-workspace.yaml
//
// For each structure, evaluate:
// 1. Fit & Complexity with the current codebase
// 2. Scalability & Maintainability
// 3. Migration Risk & Developer Experience
//
// Then:
// - Recommend A, B, or a hybrid
// - Provide a step-by-step migration plan for the chosen model
