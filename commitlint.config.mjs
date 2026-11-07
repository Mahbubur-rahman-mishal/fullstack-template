// Conventional Commits: <type>(<optional scope>): <subject>
// e.g. "feat(backend): add habit streak endpoint"
// See docs/engineering/git-workflow.md
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [
      2,
      'always',
      ['backend', 'frontend', 'e2e', 'infra', 'ci', 'docs', 'deps', 'claude', 'devcontainer', 'repo'],
    ],
    'header-max-length': [2, 'always', 100],
  },
};
