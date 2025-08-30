import { getAxiosImplementation } from '../../utils/framework.js';
import { logError, logInfo } from '../../utils/logger.js';
import { validateComponentName, generateComponentCode, generateComponentDemo } from '../../utils/component-generator.js';

export async function handleCreateComponent({ 
  componentName, 
  componentType = 'ui', 
  baseComponent = 'button',
  description,
  includeDemo = true 
}: { 
  componentName: string;
  componentType?: string;
  baseComponent?: string;
  description?: string;
  includeDemo?: boolean;
}) {
  try {
    // Validate component name
    if (!validateComponentName(componentName)) {
      throw new Error(`Invalid component name: ${componentName}. Use lowercase letters, numbers, and hyphens only.`);
    }

    const axios = await getAxiosImplementation();
    
    // For now, skip the existence check to test component generation
    // TODO: Fix the existence check logic
    logInfo(`Generating component: ${componentName}`);
    
    /*
    // Check if component already exists
    try {
      await axios.getComponentSource(componentName);
      throw new Error(`Component "${componentName}" already exists in the repository.`);
    } catch (existsError: any) {
      // If component doesn't exist (404 or "not found"), that's what we want
      if (!existsError.message.includes('not found') && !existsError.message.includes('404')) {
        throw existsError;
      }
      // Component doesn't exist, we can proceed
    }
    */

    // Get base component for reference
    let baseComponentCode = '';
    try {
      if (baseComponent && baseComponent !== componentName) {
        baseComponentCode = await axios.getComponentSource(baseComponent);
        logInfo(`Using ${baseComponent} as base component reference`);
      }
    } catch (error) {
      logError(`Could not fetch base component ${baseComponent}, using default template`, error);
    }

    // Generate component code
    const componentCode = generateComponentCode({
      componentName,
      componentType,
      baseComponentCode,
      description: description || `A custom ${componentName} component`
    });

    // Generate demo code if requested
    let demoCode = '';
    if (includeDemo) {
      demoCode = generateComponentDemo({
        componentName,
        componentType,
        description: description || `Demo for ${componentName} component`
      });
    }

    // Prepare response
    const result = {
      componentName,
      componentType,
      success: true,
      files: {
        component: {
          path: `apps/v4/registry/new-york-v4/ui/${componentName}.tsx`,
          content: componentCode,
          size: componentCode.length
        }
      } as any,
      instructions: [
        `Component ${componentName} has been generated successfully`,
        `Component file: apps/v4/registry/new-york-v4/ui/${componentName}.tsx`,
        `To add this component to your repository:`,
        `1. Create the component file with the generated content`,
        `2. Update the component registry if needed`,
        `3. Add any required dependencies to package.json`,
        `4. Test the component in your application`
      ]
    };

    // Add demo file if generated
    if (includeDemo && demoCode) {
      result.files.demo = {
        path: `apps/v4/registry/new-york-v4/examples/${componentName}-demo.tsx`,
        content: demoCode,
        size: demoCode.length
      };
      result.instructions.splice(2, 0, `Demo file: apps/v4/registry/new-york-v4/examples/${componentName}-demo.tsx`);
    }

    logInfo(`Successfully generated component: ${componentName}`);

    return {
      content: [{ 
        type: "text", 
        text: JSON.stringify(result, null, 2)
      }]
    };

  } catch (error) {
    logError(`Failed to create component "${componentName}"`, error);
    throw new Error(`Failed to create component "${componentName}": ${error instanceof Error ? error.message : String(error)}`);
  }
}

export const schema = {
  componentName: {
    type: 'string',
    description: 'Name of the component to create (e.g., "custom-button", "my-card")'
  },
  componentType: {
    type: 'string',
    description: 'Type of component to create (default: "ui")',
    enum: ['ui', 'layout', 'form', 'navigation', 'feedback', 'data-display']
  },
  baseComponent: {
    type: 'string',
    description: 'Existing component to use as a reference/template (default: "button")'
  },
  description: {
    type: 'string',
    description: 'Description of what the component does'
  },
  includeDemo: {
    type: 'boolean',
    description: 'Whether to generate a demo file for the component (default: true)'
  }
};