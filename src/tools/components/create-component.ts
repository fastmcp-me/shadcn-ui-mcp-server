import { getAxiosImplementation } from '../../utils/framework.js';
import { logError, logInfo, logWarning } from '../../utils/logger.js';
import { 
  validateComponentName, 
  generateComponentCode, 
  generateComponentDemo,  
  generateComponentInterface 
} from '../../utils/component-generator.js';
import { validateAndSanitizeParams, validateShadcnUIPatterns } from '../../utils/validation.js';

export async function handleCreateComponent(params: any) {
  try {
    // Validate and sanitize all parameters using Joi schemas
    const validatedParams = validateAndSanitizeParams<{
      componentName: string;
      componentType: string;
      baseComponent: string;
      description?: string;
      includeDemo: boolean;
      customVariants?: string[];
      customSizes?: string[];
      strictMode: boolean;
      customSourceStyles?: {
        baseClasses?: string;
        variantStyles?: Record<string, string>;
        sizeStyles?: Record<string, string>;
      };
    }>('create_component', params);

    const {
      componentName,
      componentType,
      baseComponent,
      description,
      includeDemo,
      customVariants,
      customSizes,
      strictMode,
      customSourceStyles
    } = validatedParams;

    logInfo(`Creating shadcn/ui component: ${componentName} (type: ${componentType}) with strict validation`);

    // Enhanced shadcn/ui pattern validation
    const patternValidation = validateShadcnUIPatterns({
      componentName,
      componentType,
      customVariants,
      customSizes
    });

    // Log validation warnings
    if (patternValidation.warnings.length > 0) {
      patternValidation.warnings.forEach(warning => {
        logWarning(`Shadcn/ui Pattern Warning: ${warning}`);
      });
    }

    // Throw error if validation fails
    if (!patternValidation.isValid) {
      const errorMessage = `Shadcn/ui pattern validation failed:\n${patternValidation.issues.map(issue => `• ${issue}`).join('\n')}`;
      throw new Error(errorMessage);
    }

    // Additional validation warnings for optimal component design
    if (customVariants && customVariants.length > 8) {
      logWarning(`Large number of variants (${customVariants.length}). Consider reducing for better maintainability.`);
    }
    
    if (customSizes && customSizes.length > 6) {
      logWarning(`Large number of sizes (${customSizes.length}). Consider using default size scale.`);
    }

    const axios = await getAxiosImplementation();
    
    logInfo(`Generating shadcn/ui component: ${componentName} (type: ${componentType})`);
    
    // Validate base component exists (in strict mode)
    let finalBaseComponent = baseComponent;
    if (strictMode && baseComponent && baseComponent !== componentName) {
      try {
        await axios.getComponentSource(baseComponent);
        logInfo(`Validated base component: ${baseComponent}`);
      } catch (error) {
        logWarning(`Base component "${baseComponent}" not found. Using default template.`);
        finalBaseComponent = 'button'; // Fallback to button
      }
    }

    // Get base component for reference
    let baseComponentCode = '';
    try {
      if (finalBaseComponent && finalBaseComponent !== componentName) {
        baseComponentCode = await axios.getComponentSource(finalBaseComponent);
        logInfo(`Using ${finalBaseComponent} as base component reference`);
      }
    } catch (error) {
      logError(`Could not fetch base component ${finalBaseComponent}, using default template`, error);
    }

    // Generate component code with enhanced options
    const componentCode = generateComponentCode({
      componentName,
      componentType,
      baseComponentCode,
      description: description || `A custom ${componentName} component following shadcn/ui patterns`,
      customVariants,
      customSizes,
      customSourceStyles
    });

    // Generate TypeScript interface for better type safety
    const interfaceCode = generateComponentInterface(componentName, baseComponentCode);

    // Generate demo code if requested
    let demoCode = '';
    if (includeDemo) {
      demoCode = generateComponentDemo({
        componentName,
        componentType,
        description: description || `Demo showcasing ${componentName} component variants`
      });
    }

    // Prepare comprehensive response
    const result = {
      componentName,
      componentType,
      success: true,
      metadata: {
        shadcnCompliant: patternValidation.shadcnCompliant,
        framework: 'React',
        typescript: true,
        baseComponent: finalBaseComponent || 'default-template',
        strictMode,
        hasCustomVariants: !!(customVariants && customVariants.length > 0),
        variantCount: customVariants?.length || 0,
        validationSummary: patternValidation.summary,
        hasWarnings: patternValidation.warnings.length > 0,
        warningCount: patternValidation.warnings.length
      },
      files: {
        component: {
          path: `apps/v4/registry/new-york-v4/ui/${componentName}.tsx`,
          content: componentCode,
          size: componentCode.length,
          type: 'component'
        },
        interface: {
          path: `apps/v4/registry/new-york-v4/types/${componentName}-types.ts`,
          content: interfaceCode,
          size: interfaceCode.length,
          type: 'types'
        }
      } as any,
      shadcnPatterns: {
        forwardRef: true,
        variantSystem: true,
        classVarianceAuthority: true,
        radixSlot: true,
        cnUtility: true,
        semanticTokens: true
      },
      instructions: [
        `✅ Component "${componentName}" generated successfully`,
        `📁 Component file: apps/v4/registry/new-york-v4/ui/${componentName}.tsx`,
        `📁 Types file: apps/v4/registry/new-york-v4/types/${componentName}-types.ts`,
        `🎨 Component type: ${componentType}`,
        `🔧 Based on: ${finalBaseComponent || 'default template'}`,
        '',
        '📋 Next steps:',
        '1. Create the component file with the generated content',
        '2. Add TypeScript types file for better development experience',
        '3. Update your component registry index file',
        '4. Install required dependencies: @radix-ui/react-slot, class-variance-authority',
        '5. Ensure your utils.ts file includes the cn() utility function',
        '6. Test the component in your application',
        '',
        '🎯 Shadcn/ui compliance features:',
        '• ✅ Uses React.forwardRef for ref forwarding',
        '• ✅ Implements asChild prop for composition',
        '• ✅ Uses CVA (Class Variance Authority) for variants',
        '• ✅ Includes cn() utility for class merging',
        '• ✅ Follows semantic design token patterns',
        '• ✅ TypeScript ready with proper prop interfaces'
      ]
    };

    // Add demo file if generated
    if (includeDemo && demoCode) {
      result.files.demo = {
        path: `apps/v4/registry/new-york-v4/examples/${componentName}-demo.tsx`,
        content: demoCode,
        size: demoCode.length,
        type: 'demo'
      };
      result.instructions.splice(3, 0, `📁 Demo file: apps/v4/registry/new-york-v4/examples/${componentName}-demo.tsx`);
    }

    // Add custom variants info if provided
    if (customVariants && customVariants.length > 0) {
      result.instructions.splice(-6, 0, `🎨 Custom variants: ${customVariants.join(', ')}`);
    }

    logInfo(`Successfully generated shadcn/ui compliant component: ${componentName}`);
    
    // Log compliance summary
    logInfo(`Component compliance: TypeScript ✅, forwardRef ✅, CVA variants ✅, Radix Slot ✅`);

    return {
      content: [{ 
        type: "text", 
        text: JSON.stringify(result, null, 2)
      }]
    };

  } catch (error) {
    logError(`Failed to create shadcn/ui component "${params?.componentName || 'unknown'}"`, error);
    
    // Provide helpful error messages based on validation failures
    let errorMessage = `Failed to create component: `;
    
    if (error instanceof Error) {
      if (error.message.includes('Validation failed')) {
        // Extract validation details from Joi error
        errorMessage += '\n\n📋 Validation Requirements:\n';
        errorMessage += '• Component name: lowercase with hyphens only (e.g., "custom-button")\n';
        errorMessage += '• Component type: must be one of ui, layout, form, navigation, feedback, data-display\n';
        errorMessage += '• Custom variants: lowercase with hyphens only, max 8 variants\n';
        errorMessage += '• Custom sizes: lowercase with hyphens only, max 6 sizes\n';
        errorMessage += '• Base component: must be existing shadcn/ui component name\n\n';
        errorMessage += `❌ ${error.message}`;
      } else if (error.message.includes('component name')) {
        errorMessage += 'Component name validation failed. Use lowercase, hyphens, and start with a letter.';
      } else if (error.message.includes('component type')) {
        errorMessage += 'Component type must be one of: ui, layout, form, navigation, feedback, data-display.';
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
    description: 'Name of the component to create in kebab-case (e.g., "custom-button", "data-table", "user-profile")'
  },
  componentType: {
    type: 'string',
    description: 'Type of component following shadcn/ui patterns (default: "ui")',
    enum: ['ui', 'layout', 'form', 'navigation', 'feedback', 'data-display']
  },
  baseComponent: {
    type: 'string',
    description: 'Existing shadcn/ui component to use as template (default: "button"). Common options: button, card, input, label'
  },
  description: {
    type: 'string',
    description: 'Description of what the component does and its purpose'
  },
  includeDemo: {
    type: 'boolean',
    description: 'Whether to generate a demo file showcasing component variants (default: true)'
  },
  customVariants: {
    type: 'array',
    description: 'Custom variant names to add beyond default ones (must be lowercase with hyphens)',
    items: {
      type: 'string'
    }
  },
  customSizes: {
    type: 'array',
    description: 'Custom size names to add beyond default ones (sm, default, lg)',
    items: {
      type: 'string'
    }
  },
  strictMode: {
    type: 'boolean',
    description: 'Enforce strict shadcn/ui compliance (default: true). Validates component types, base components, and naming'
  },
  customSourceStyles: {
    type: 'object',
    description: 'Custom source styles to override default styling throughout the component generation process',
    properties: {
      baseClasses: {
        type: 'string',
        description: 'Custom base CSS classes for the component (overrides default shadcn base classes)'
      },
      variantStyles: {
        type: 'object',
        description: 'Custom CSS classes for specific variants (e.g., {"primary": "bg-blue-500 text-white"})'
      },
      sizeStyles: {
        type: 'object',
        description: 'Custom CSS classes for specific sizes (e.g., {"large": "h-12 px-6 text-lg"})'
      }
    }
  }
};