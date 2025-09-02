# Push Component Guide

This guide explains how to use the new **push_component** functionality to contribute components back to the UI repositories.

## Overview

The `push_component` tool allows you to push created components directly to their respective UI repositories:
- **React**: [YashTellis/ui](https://github.com/YashTellis/ui)
- **Vue**: [unovue/shadcn-vue](https://github.com/unovue/shadcn-vue) 
- **Svelte**: [huntabyte/shadcn-svelte](https://github.com/huntabyte/shadcn-svelte)

## Prerequisites

### 1. GitHub Personal Access Token

You **must** have a GitHub Personal Access Token with appropriate permissions:

```bash
# Set your GitHub token
export GITHUB_PERSONAL_ACCESS_TOKEN=ghp_your_token_here
```

#### Required Permissions

For **public repositories**:
- `Contents: Write` permission
- No additional scopes needed

For **private repositories**:
- `Contents: Write` permission  
- `Metadata: Read` permission
- Repository access (if you're not the owner)

#### Creating a GitHub Token

1. Go to [GitHub Settings > Personal Access Tokens](https://github.com/settings/tokens)
2. Click "Generate new token" → "Fine-grained personal access token"
3. Select the repository you want to contribute to
4. Grant the following permissions:
   - **Contents: Write** (required)
   - **Metadata: Read** (required)
   - **Pull requests: Write** (if creating PRs)

### 2. Repository Access

You need **write access** to the target repository. This can be achieved through:
- **Fork the repository** and push to your fork
- **Direct collaborator access** to the original repository
- **Organization membership** with write permissions

## Usage

### Basic Usage

```typescript
// Use the push_component tool
{
  "name": "push_component",
  "arguments": {
    "componentName": "my-custom-button",
    "componentCode": "import React from 'react';\n\nexport const MyCustomButton = () => {\n  return <button>Custom Button</button>;\n};"
  }
}
```

### Complete Example

```typescript
{
  "name": "push_component", 
  "arguments": {
    "componentName": "animated-card",
    "componentCode": "// React component code here",
    "demoCode": "// Demo usage code here",
    "commitMessage": "Add animated card component with hover effects",
    "branch": "main",
    "createPullRequest": true
  }
}
```

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `componentName` | string | ✅ | Component name (kebab-case, e.g., "my-button") |
| `componentCode` | string | ✅ | The component source code |
| `demoCode` | string | ❌ | Optional demo/example code |
| `commitMessage` | string | ❌ | Custom commit message (default: "Add {componentName} component") |
| `branch` | string | ❌ | Target branch (default: framework-specific) |
| `createPullRequest` | boolean | ❌ | Create PR instead of direct commit (default: true) |

## Framework-Specific Behavior

### React (YashTellis/ui)
- **Repository**: `YashTellis/ui`
- **Component Path**: `apps/v4/registry/new-york-v4/ui/{componentName}.tsx`
- **Demo Path**: `apps/v4/registry/new-york-v4/examples/{componentName}-demo.tsx`
- **Default Branch**: `main`
- **File Extension**: `.tsx`

### Vue (shadcn-vue)
- **Repository**: `unovue/shadcn-vue`
- **Component Path**: `apps/v4/registry/new-york-v4/ui/{componentName}/{ComponentName}.vue`
- **Demo Path**: `apps/v4/components/{ComponentName}Demo.vue`
- **Default Branch**: `dev`
- **File Extension**: `.vue`

### Svelte (shadcn-svelte)
- **Repository**: `huntabyte/shadcn-svelte`
- **Component Path**: `docs/src/lib/registry/ui/{componentName}/{componentName}.svelte`
- **Demo Path**: `docs/src/lib/registry/examples/{componentName}-demo.svelte`
- **Default Branch**: `main`
- **File Extension**: `.svelte`

## Workflow Examples

### 1. Create and Push a New Component

```bash
# Step 1: Create component using create_component
{
  "name": "create_component",
  "arguments": {
    "componentName": "gradient-button",
    "description": "A button with gradient background and hover effects"
  }
}

# Step 2: Push the generated component 
{
  "name": "push_component",
  "arguments": {
    "componentName": "gradient-button",
    "componentCode": "// Generated component code from step 1",
    "demoCode": "// Generated demo code from step 1",
    "createPullRequest": true
  }
}
```

### 2. Fork-Based Contribution

If you don't have direct write access:

1. **Fork the repository** on GitHub
2. **Update repository constants** in the appropriate axios file to point to your fork:
   ```typescript
   const REPO_OWNER = 'your-username'; // Instead of 'YashTellis'
   ```
3. **Push to your fork** using the tool
4. **Create a manual PR** from your fork to the original repository

### 3. Direct Repository Access

If you have write access to the original repository:

```typescript
{
  "name": "push_component",
  "arguments": {
    "componentName": "data-table-advanced",
    "componentCode": "// Your component code",
    "createPullRequest": true, // Creates PR for review
    "commitMessage": "feat: add advanced data table with sorting and filtering"
  }
}
```

## Response Format

Successful push returns:

```json
{
  "componentName": "my-button",
  "success": true,
  "repository": "YashTellis/ui",
  "branch": "add-my-button-component-1234567890",
  "files": [
    {
      "path": "apps/v4/registry/new-york-v4/ui/my-button.tsx",
      "sha": "abc123...",
      "size": 1234,
      "url": "https://github.com/YashTellis/ui/blob/..."
    }
  ],
  "commitSha": "abc123...",
  "pullRequest": {
    "number": 42,
    "url": "https://github.com/YashTellis/ui/pull/42",
    "title": "Add my-button component"
  },
  "instructions": [
    "Component my-button has been pushed to the repository successfully",
    "Repository: YashTellis/ui",
    "Pull Request created: https://github.com/YashTellis/ui/pull/42",
    "PR Number: #42",
    "Review the changes and merge when ready"
  ]
}
```

## Error Handling

### Common Errors

#### Authentication Failed
```
Error: Authentication failed. Please check your GITHUB_PERSONAL_ACCESS_TOKEN.
```
**Solution**: Verify your GitHub token is valid and has not expired.

#### Permission Denied
```
Error: Permission denied. Make sure your GitHub token has write access to YashTellis/ui.
```
**Solution**: 
1. Ensure your token has `Contents: Write` permission
2. Verify you have write access to the repository
3. Consider forking the repository if you don't have direct access

#### Repository Not Found
```
Error: Repository YashTellis/ui not found or branch main does not exist.
```
**Solution**: Check that the repository exists and the branch name is correct.

#### Component Already Exists
```
Warning: Component "my-button" already exists. This will update the existing component.
```
**Note**: This is a warning. The tool will update the existing component.

## Best Practices

### 1. Component Naming
- Use **kebab-case** for component names: `my-custom-button`
- Be descriptive but concise: `data-table-advanced` not `table`
- Avoid conflicts with existing components

### 2. Code Quality
- Follow the existing component patterns in the repository
- Include proper TypeScript types
- Add JSDoc comments for complex components
- Ensure components are accessible (a11y)

### 3. Pull Request Strategy
- **Always use Pull Requests** for contributions (`createPullRequest: true`)
- Write descriptive commit messages
- Test components before pushing
- Review changes before merging

### 4. Testing Before Push
```bash
# Test your component locally first
npm run dev
# or 
npm run storybook
```

### 5. Repository Maintenance
- Keep your fork up to date if using fork-based workflow
- Follow the repository's contribution guidelines
- Coordinate with maintainers for major changes

## Security Considerations

### Token Security
- **Never commit** GitHub tokens to code
- Use environment variables: `GITHUB_PERSONAL_ACCESS_TOKEN`
- Regularly rotate your tokens
- Use fine-grained tokens with minimal permissions

### Repository Access
- Only push to repositories you have permission to modify
- Be cautious when pushing to shared/public repositories
- Review changes before creating pull requests

## Troubleshooting

### Cannot Push to Repository
1. Verify GitHub token permissions
2. Check repository write access
3. Ensure target branch exists
4. Try pushing to a fork instead

### Rate Limiting
```
Error: GitHub API rate limit exceeded
```
**Solution**: Wait for rate limit reset or use a GitHub token for higher limits.

### Network Issues
```
Error: Network error: ETIMEDOUT
```
**Solution**: Check internet connection and GitHub status.

## Advanced Usage

### Custom Branches
```typescript
{
  "name": "push_component",
  "arguments": {
    "componentName": "feature-component",
    "componentCode": "// code here",
    "branch": "feature/new-components",
    "createPullRequest": false // Direct commit to branch
  }
}
```

### Batch Component Creation
Use the tool multiple times in sequence to push multiple related components.

### Integration with CI/CD
The push functionality can be integrated into automated workflows for component management.

## Contributing

When contributing components:

1. **Follow repository guidelines** for each framework
2. **Test thoroughly** before pushing
3. **Document your components** with clear descriptions
4. **Be responsive** to code review feedback
5. **Keep changes focused** - one component per PR

## Support

For issues with the push functionality:

1. Check this guide first
2. Verify GitHub token permissions
3. Test with a simple component
4. Open an issue with detailed error information

---

**Happy contributing! 🚀**