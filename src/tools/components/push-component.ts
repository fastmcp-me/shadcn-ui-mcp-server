import { getAxiosImplementation } from '../../utils/framework.js';
import { logError, logInfo, logWarning } from '../../utils/logger.js';
import { validateAndSanitizeParams } from '../../utils/validation.js';

export async function handlePushComponent(params: any) {
  try {
    // Validate and sanitize all parameters using Joi schemas
    const validatedParams = validateAndSanitizeParams<{
      componentName: string;
      componentCode: string;
      demoCode?: string;
      commitMessage: string;
      branch: string;
      createPullRequest: boolean;
      autoMerge: boolean;
    }>('push_component', params);

    const {
      componentName,
      componentCode,
      demoCode,
      commitMessage,
      branch,
      createPullRequest,
      autoMerge
    } = validatedParams;

    logInfo(`Pushing shadcn/ui component "${componentName}" to repository with validation...`);

    const axios = await getAxiosImplementation();

    // Check if we have the necessary functions available
    if (!axios.pushComponentToRepository) {
      throw new Error('Push functionality is not available for the current framework. Please ensure you have write access to the repository and GitHub token is configured.');
    }

    // Check if component already exists
    try {
      await axios.getComponentSource(componentName);
      logWarning(`Component "${componentName}" already exists. This will update the existing component.`);
    } catch (existsError: any) {
      // If component doesn't exist (404 or "not found"), that's expected for new components
      if (!existsError.message.includes('not found') && !existsError.message.includes('404')) {
        throw existsError;
      }
      logInfo(`Creating new component "${componentName}"`);
    }

    // Prepare files to push
    const filesToPush: Array<{
      type: 'component' | 'demo';
      content: string;
      name: string;
    }> = [
      {
        type: 'component' as const,
        content: componentCode,
        name: componentName
      }
    ];

    // Add demo file if provided
    if (demoCode && demoCode.trim().length > 0) {
      filesToPush.push({
        type: 'demo' as const,
        content: demoCode,
        name: componentName
      });
    }

    // Push to repository
    const result = await axios.pushComponentToRepository({
      componentName,
      files: filesToPush,
      commitMessage,
      branch,
      createPullRequest,
      autoMerge
    });

    logInfo(`Successfully pushed component "${componentName}" to repository`);

    // Prepare response
    const response = {
      componentName,
      success: true,
      repository: result.repository,
      branch: result.branch,
      files: result.files,
      commitSha: result.commitSha,
      pullRequest: result.pullRequest,
      instructions: [
        `Component "${componentName}" has been pushed to the repository successfully`,
        `Repository: ${result.repository}`,
        `Branch: ${result.branch}`,
        `Commit SHA: ${result.commitSha}`,
        ...(result.pullRequest ? [
          `Pull Request created: ${result.pullRequest.url}`,
          `PR Number: #${result.pullRequest.number}`,
          ...(result.pullRequest.autoMerged ? [
            `Pull Request has been automatically merged`,
            `Component is now available in the ${result.branch} branch`
          ] : [
            `Review the changes and merge when ready`
          ])
        ] : [
          `Changes committed directly to ${result.branch} branch`,
          `Component is now available in the repository`
        ]),
        `Files pushed:`,
        ...result.files.map((file: any) => `  - ${file.path} (${file.size} bytes)`)
      ]
    };

    return {
      content: [{ 
        type: "text", 
        text: JSON.stringify(response, null, 2)
      }]
    };

  } catch (error) {
    logError(`Failed to push component "${params?.componentName || 'unknown'}"`, error);
    
    // Provide helpful error messages based on validation failures
    let errorMessage = `Failed to push component: `;
    
    if (error instanceof Error) {
      if (error.message.includes('Validation failed')) {
        // Extract validation details from Joi error
        errorMessage += '\n\n📋 Push Requirements:\n';
        errorMessage += '• Component name: lowercase with hyphens only (e.g., "custom-button")\n';
        errorMessage += '• Component code: required, minimum 100 characters, maximum 50,000 characters\n';
        errorMessage += '• Demo code: optional, maximum 20,000 characters\n';
        errorMessage += '• Commit message: minimum 10 characters, maximum 200 characters\n\n';
        errorMessage += `❌ ${error.message}`;
      } else {
        errorMessage += error.message;
      }
    } else {
      errorMessage += String(error);
    }
    
    throw new Error(errorMessage);
  }
}

export const schema = {
  componentName: {
    type: 'string',
    description: 'Name of the component to push (e.g., "custom-button", "my-card")'
  },
  componentCode: {
    type: 'string',
    description: 'The source code of the component to push to the repository'
  },
  demoCode: {
    type: 'string',
    description: 'Optional demo code for the component'
  },
  commitMessage: {
    type: 'string',
    description: 'Commit message for the changes (default: "Add {componentName} component")'
  },
  branch: {
    type: 'string',
    description: 'Target branch for the changes (default: "main" for React, "dev" for Vue, "main" for Svelte)'
  },
  createPullRequest: {
    type: 'boolean',
    description: 'Whether to create a pull request instead of committing directly (default: true)'
  },
  autoMerge: {
    type: 'boolean',
    description: 'Whether to automatically merge the pull request after creation (default: false)'
  }
};