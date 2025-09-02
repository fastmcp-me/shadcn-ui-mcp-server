import Joi from 'joi';

// Validation schema for preview component parameters
export const previewComponentSchema = Joi.object({
  componentName: Joi.string()
    .pattern(/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/)
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.pattern.base': 'Component name must be lowercase, start with a letter, and use hyphens only (e.g., "custom-button", "data-table")',
      'string.min': 'Component name must be at least 2 characters long',
      'string.max': 'Component name must not exceed 50 characters',
      'any.required': 'Component name is required'
    }),

  componentCode: Joi.string()
    .min(50)
    .max(100000)
    .required()
    .messages({
      'string.min': 'Component code must be at least 50 characters long',
      'string.max': 'Component code must not exceed 100,000 characters',
      'any.required': 'Component code is required'
    }),

  demoCode: Joi.string()
    .max(50000)
    .optional()
    .messages({
      'string.max': 'Demo code must not exceed 50,000 characters'
    }),

  previewMode: Joi.string()
    .valid('inline', 'standalone', 'storybook')
    .default('standalone')
    .messages({
      'any.only': 'Preview mode must be one of: inline, standalone, storybook'
    }),

  includeStyles: Joi.boolean()
    .default(true)
    .messages({
      'boolean.base': 'includeStyles must be a boolean value'
    })
});

// Add to validation registry
export function validatePreviewComponent(params: any) {
  const { error, value } = previewComponentSchema.validate(params, {
    abortEarly: false,
    allowUnknown: false,
    stripUnknown: true
  });

  if (error) {
    const errorMessage = error.details.map(detail => detail.message).join(', ');
    throw new Error(`Validation failed: ${errorMessage}`);
  }

  return value;
}