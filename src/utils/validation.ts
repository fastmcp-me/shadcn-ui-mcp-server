import Joi = require('joi');


/**
 * Validation schemas for different request types
 */
export const validationSchemas = {
  // Component-related schemas
  componentName: Joi.object({
    componentName: Joi.string().required().min(1).max(100)
      .description('Name of the shadcn/ui component')
  }),

  // Search schemas
  searchQuery: Joi.object({
    query: Joi.string().required().min(1).max(500)
      .description('Search query string')
  }),

  // Optional query schemas
  optionalQuery: Joi.object({
    query: Joi.string().optional().max(500)
      .description('Optional query string')
  }),

  // Block schemas
  blockQuery: Joi.object({
    query: Joi.string().optional().max(500)
      .description('Optional search query'),
    category: Joi.string().optional().max(100)
      .description('Optional category filter')
  }),

  // Component creation schemas
  createComponent: Joi.object({
    componentName: Joi.string().required().min(2).max(50)
      .pattern(/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/)
      .message('Component name must be lowercase, start with a letter, and use hyphens only (e.g., "custom-button", "data-table")')
      .description('Name of the component in kebab-case'),
    componentType: Joi.string().optional().valid('ui', 'layout', 'form', 'navigation', 'feedback', 'data-display')
      .default('ui')
      .description('Type of component following shadcn/ui patterns'),
    baseComponent: Joi.string().optional().min(1).max(100)
      .pattern(/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/)
      .default('button')
      .description('Existing shadcn/ui component to use as template'),
    description: Joi.string().optional().min(5).max(500)
      .description('Description of what the component does'),
    includeDemo: Joi.boolean().optional().default(true)
      .description('Whether to generate a demo file'),
    customVariants: Joi.array().items(
      Joi.string().pattern(/^[a-z][a-z-]*$/)
        .message('Custom variants must be lowercase with hyphens only')
    ).optional().max(8)
      .description('Additional variant names (max 8)'),
    customSizes: Joi.array().items(
      Joi.string().pattern(/^[a-z][a-z-]*$/)
        .message('Custom sizes must be lowercase with hyphens only')
    ).optional().max(6)
      .description('Additional size names (max 6)'),
    strictMode: Joi.boolean().optional().default(true)
      .description('Enforce strict shadcn/ui compliance'),
    customSourceStyles: Joi.object({
      baseClasses: Joi.string().optional().max(1000)
        .description('Custom base CSS classes for the component'),
      variantStyles: Joi.object().pattern(
        Joi.string().pattern(/^[a-z][a-z-]*$/),
        Joi.string().max(500)
      ).optional()
        .description('Custom CSS classes for variants'),
      sizeStyles: Joi.object().pattern(
        Joi.string().pattern(/^[a-z][a-z-]*$/),
        Joi.string().max(500)
      ).optional()
        .description('Custom CSS classes for sizes')
    }).optional()
      .description('Custom source styles to override default styling')
  }),

  // Component push schemas
  pushComponent: Joi.object({
    componentName: Joi.string().required().min(2).max(50)
      .pattern(/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/)
      .message('Component name must be lowercase, start with a letter, and use hyphens only')
      .description('Name of the component to push'),
    componentCode: Joi.string().required().min(100).max(50000)
      .description('Source code of the component'),
    demoCode: Joi.string().optional().max(20000)
      .description('Optional demo code for the component'),
    commitMessage: Joi.string().optional().min(10).max(200)
      .default('Add {componentName} component')
      .description('Commit message for the changes'),
    branch: Joi.string().optional().min(1).max(100)
      .default('main')
      .description('Target branch for the changes'),
    createPullRequest: Joi.boolean().optional().default(true)
      .description('Whether to create a pull request'),
    autoMerge: Joi.boolean().optional().default(false)
      .description('Whether to automatically merge the pull request')
  }),

  // Component preview schemas
  previewComponent: Joi.object({
    componentName: Joi.string().required().min(2).max(50)
      .pattern(/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/)
      .message('Component name must be lowercase, start with a letter, and use hyphens only')
      .description('Name of the component to preview'),
    componentCode: Joi.string().required().min(50).max(100000)
      .description('Source code of the component to preview'),
    demoCode: Joi.string().optional().max(50000)
      .description('Optional demo code showing component usage'),
    previewMode: Joi.string().optional().valid('inline', 'standalone', 'storybook')
      .default('standalone')
      .description('Preview rendering mode'),
    includeStyles: Joi.boolean().optional().default(true)
      .description('Whether to include Tailwind CSS and shadcn/ui styles')
  }),

  // Preview dashboard schemas
  previewDashboard: Joi.object({
    showAll: Joi.boolean().optional().default(true)
      .description('Whether to show all components or only recent ones'),
    theme: Joi.string().optional().valid('light', 'dark', 'auto')
      .default('auto')
      .description('Dashboard theme preference'),
    sortBy: Joi.string().optional().valid('name', 'date', 'type')
      .default('date')
      .description('Sort components by criteria')
  }),

  // Directory structure schemas
  directoryStructure: Joi.object({
    path: Joi.string().optional().max(500)
      .description('Path within the repository'),
    owner: Joi.string().optional().max(100)
      .description('Repository owner'),
    repo: Joi.string().optional().max(100)
      .description('Repository name'),
    branch: Joi.string().optional().max(100)
      .description('Branch name')
  }),

  // Block schemas
  blockRequest: Joi.object({
    blockName: Joi.string().required().min(1).max(200)
      .description('Name of the block'),
    includeComponents: Joi.boolean().optional()
      .description('Whether to include component files')
  }),

  // Resource schemas
  resourceRequest: Joi.object({
    uri: Joi.string().required().min(1).max(1000)
      .description('Resource URI')
  }),

  // Prompt schemas
  promptRequest: Joi.object({
    name: Joi.string().required().min(1).max(200)
      .description('Prompt name'),
    arguments: Joi.object().optional()
      .description('Prompt arguments')
  }),

  // Tool schemas
  toolRequest: Joi.object({
    name: Joi.string().required().min(1).max(200)
      .description('Tool name'),
    arguments: Joi.object().optional()
      .description('Tool arguments')
  })
};

/**
 * Validate request parameters against a schema
 * @param schema Joi schema to validate against
 * @param params Parameters to validate
 * @returns Validated parameters
 * @throws ValidationError if validation fails
 */
export function validateRequest<T>(
  schema: Joi.ObjectSchema,
  params: any
): T {
  try {
    const { error, value } = schema.validate(params, {
      abortEarly: false,
      stripUnknown: true,
      allowUnknown: false
    });

    if (error) {
      const errorMessages = error.details.map(detail => 
        `${detail.path.join('.')}: ${detail.message}`
      ).join(', ');
      
      throw new Error(`Validation failed: ${errorMessages}`);
    }

    return value as T;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Unexpected validation error: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Get validation schema for a specific method
 * @param method Method name
 * @returns Joi schema or undefined
 */
export function getValidationSchema(method: string): Joi.ObjectSchema | undefined {
  const schemaMap: Record<string, Joi.ObjectSchema> = {
    // Component methods
    'get_component': validationSchemas.componentName,
    'get_component_demo': validationSchemas.componentName,
    'get_component_metadata': validationSchemas.componentName,
    'get_component_details': validationSchemas.componentName,
    'get_examples': validationSchemas.componentName,
    'get_usage': validationSchemas.componentName,
    'create_component': validationSchemas.createComponent,
    'push_component': validationSchemas.pushComponent,
    'preview_component': validationSchemas.previewComponent,
    'preview_dashboard': validationSchemas.previewDashboard,
    
    // Search methods
    'search_components': validationSchemas.searchQuery,
    'get_themes': validationSchemas.optionalQuery,
    'get_blocks': validationSchemas.blockQuery,
    
    // Directory methods
    'get_directory_structure': validationSchemas.directoryStructure,
    
    // Block methods
    'get_block': validationSchemas.blockRequest,
    
    // Resource methods
    'read_resource': validationSchemas.resourceRequest,
    
    // Prompt methods
    'get_prompt': validationSchemas.promptRequest,
    
    // Tool methods
    'call_tool': validationSchemas.toolRequest
  };

  return schemaMap[method];
}

/**
 * Validate and sanitize input parameters
 * @param method Method name
 * @param params Parameters to validate
 * @returns Validated and sanitized parameters
 */
export function validateAndSanitizeParams<T>(
  method: string,
  params: any
): T {
  const schema = getValidationSchema(method);
  
  if (!schema) {
    // If no specific schema found, return params as-is
    return params as T;
  }

  return validateRequest<T>(schema, params);
}

/**
 * Enhanced validation specifically for shadcn/ui component patterns
 * @param componentName Component name to validate
 * @param componentType Component type to validate
 * @param customVariants Custom variants to validate
 * @param customSizes Custom sizes to validate
 * @returns Validation result with detailed feedback
 */
export function validateShadcnUIPatterns({
  componentName,
  componentType = 'ui',
  customVariants = [],
  customSizes = []
}: {
  componentName: string;
  componentType?: string;
  customVariants?: string[];
  customSizes?: string[];
}) {
  const issues: string[] = [];
  const warnings: string[] = [];
  
  // Enhanced component name validation
  if (!/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(componentName)) {
    issues.push('Component name must follow kebab-case: lowercase letters, numbers, and hyphens only');
  }
  
  if (componentName.length < 2 || componentName.length > 50) {
    issues.push('Component name must be between 2-50 characters');
  }
  
  if (componentName.endsWith('-')) {
    issues.push('Component name cannot end with a hyphen');
  }
  
  // Check for shadcn/ui naming conventions
  const reservedNames = ['button', 'card', 'input', 'label', 'select', 'textarea', 'checkbox', 'radio'];
  if (reservedNames.includes(componentName)) {
    warnings.push(`Component name "${componentName}" conflicts with existing shadcn/ui component. Consider using a prefix like "custom-${componentName}"`);
  }
  
  // Validate component type against shadcn/ui patterns
  const validTypes = ['ui', 'layout', 'form', 'navigation', 'feedback', 'data-display'];
  if (!validTypes.includes(componentType)) {
    issues.push(`Component type "${componentType}" is not a valid shadcn/ui pattern. Use one of: ${validTypes.join(', ')}`);
  }
  
  // Enhanced validation for variant duplication
  const defaultVariants = ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'];
  const allVariants = [...defaultVariants, ...customVariants];
  
  // Check for duplicate variants within custom variants
  const duplicateCustomVariants = customVariants.filter((item, index) => customVariants.indexOf(item) !== index);
  if (duplicateCustomVariants.length > 0) {
    issues.push(`Duplicate custom variants found: [${[...new Set(duplicateCustomVariants)].join(', ')}]`);
  }
  
  // Check for conflicts between custom and default variants (only for non-ui types)
  // For 'ui' type, 'secondary' is a valid default variant
  let conflictingVariants = [];
  if (componentType === 'ui') {
    // For UI components, exclude 'secondary' from conflict check
    const uiDefaultVariants = ['default', 'destructive', 'outline', 'ghost', 'link'];
    conflictingVariants = customVariants.filter(v => uiDefaultVariants.includes(v));
  } else {
    // For other component types, check against their respective defaults
    conflictingVariants = customVariants.filter(v => defaultVariants.includes(v));
  }
  
  if (conflictingVariants.length > 0) {
    warnings.push(`Custom variants [${conflictingVariants.join(', ')}] conflict with default variants`);
  }
  
  // Validate custom variants naming conventions
  customVariants.forEach(variant => {
    if (!/^[a-z][a-z0-9-]*$/.test(variant)) {
      issues.push(`Custom variant "${variant}" must be lowercase with hyphens only, starting with a letter`);
    }
    if (variant.length > 20) {
      warnings.push(`Custom variant "${variant}" is very long. Consider shorter names for better readability`);
    }
    if (variant.endsWith('-')) {
      issues.push(`Custom variant "${variant}" cannot end with a hyphen`);
    }
  });
  
  // Enhanced validation for size variation handling
  const defaultSizes = ['sm', 'default', 'lg', 'icon'];
  const allSizes = [...defaultSizes, ...customSizes];
  
  // Check for duplicate sizes within custom sizes
  const duplicateCustomSizes = customSizes.filter((item, index) => customSizes.indexOf(item) !== index);
  if (duplicateCustomSizes.length > 0) {
    issues.push(`Duplicate custom sizes found: [${[...new Set(duplicateCustomSizes)].join(', ')}]`);
  }
  
  // Check for conflicts between custom and default sizes
  const conflictingSizes = customSizes.filter(s => defaultSizes.includes(s));
  if (conflictingSizes.length > 0) {
    warnings.push(`Custom sizes [${conflictingSizes.join(', ')}] conflict with default sizes`);
  }
  
  // Validate custom sizes naming conventions
  customSizes.forEach(size => {
    if (!/^[a-z][a-z0-9-]*$/.test(size)) {
      issues.push(`Custom size "${size}" must be lowercase with hyphens only, starting with a letter`);
    }
    if (size.endsWith('-')) {
      issues.push(`Custom size "${size}" cannot end with a hyphen`);
    }
  });

  // Performance warnings
  if (customVariants.length > 8) {
    warnings.push(`Large number of variants (${customVariants.length}) may impact bundle size and maintainability`);
  }
  
  if (customSizes.length > 6) {
    warnings.push(`Large number of sizes (${customSizes.length}) may create inconsistent design scale`);
  }
  
  // Better naming convention enforcement for variants and sizes
  const validateNamingConvention = (name: string, type: string) => {
    // Check for common anti-patterns in naming
    const antiPatterns = [
      { pattern: /^btn-/, message: 'Avoid "btn-" prefix, use semantic names' },
      { pattern: /^comp-/, message: 'Avoid "comp-" prefix, use descriptive names' },
      { pattern: /[^a-z0-9-]/, message: 'Only lowercase letters, numbers, and hyphens allowed' },
      { pattern: /--/, message: 'Double hyphens are not allowed' },
      { pattern: /-$/, message: 'Names should not end with hyphen' }
    ];
    
    antiPatterns.forEach(({ pattern, message }) => {
      if (pattern.test(name)) {
        warnings.push(`${type} "${name}" ${message}`);
      }
    });
  };
  
  customVariants.forEach(variant => validateNamingConvention(variant, 'Variant'));
  customSizes.forEach(size => validateNamingConvention(size, 'Size'));
  
  return {
    isValid: issues.length === 0,
    issues,
    warnings,
    shadcnCompliant: issues.length === 0 && warnings.length === 0,
    summary: {
      componentName,
      componentType,
      totalVariants: customVariants.length,
      totalSizes: customSizes.length,
      hasConflicts: conflictingVariants.length > 0 || conflictingSizes.length > 0,
      hasDuplicates: duplicateCustomVariants.length > 0 || duplicateCustomSizes.length > 0
    }
  };
} 