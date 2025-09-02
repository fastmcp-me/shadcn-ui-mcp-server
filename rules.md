Component Generation Rules and Conditions
1. Component Name Validation Rules
Required Pattern:

Must follow kebab-case format: ^[a-z][a-z0-9]*(-[a-z0-9]+)*$
Must start with a lowercase letter
Can contain lowercase letters, numbers, and hyphens only
Cannot end with a hyphen
Length must be between 2-50 characters
Examples:

✅ Valid: custom-button, data-table, user-profile
❌ Invalid: CustomButton, custom_button, custom-button-, a, very-long-component-name-that-exceeds-the-limit
2. Component Type Restrictions
Allowed Types:

ui (default) - General UI components
layout - Layout-related components
form - Form input components
navigation - Navigation components
feedback - Feedback/notification components
data-display - Data display components
3. Base Component Requirements
Template Source:

Must be an existing shadcn/ui component name (kebab-case)
Defaults to button if not specified
Used as architectural template for the new component
4. Custom Variants Rules
Validation:

Must follow pattern: ^[a-z][a-z-]*$ (lowercase with hyphens)
Maximum of 8 custom variants allowed
Cannot duplicate default variants: default, destructive, outline, secondary, ghost, link
Length should be ≤ 20 characters (warning for longer names)
5. Custom Sizes Rules
Validation:

Must follow pattern: ^[a-z][a-z-]*$ (lowercase with hyphens)
Maximum of 6 custom sizes allowed
Cannot duplicate default sizes: sm, default, lg, icon
6. Custom Source Styles Structure
Optional Customization:

tsx
{
  baseClasses?: string;           // Max 1000 characters
  variantStyles?: Record<string, string>; // Max 500 chars per style
  sizeStyles?: Record<string, string>;    // Max 500 chars per style
}
7. Architecture Compliance Requirements
Mandatory shadcn/ui Patterns:

Must use React.forwardRef pattern
Must include asChild prop with Radix UI Slot
Must use class-variance-authority (CVA) for variants
Must implement proper TypeScript interfaces
Must use cn() utility for className merging
Must extend appropriate HTML element attributes
Required Imports:

tsx
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
8. Generated Code Structure
Component Structure:

Imports section
CVA variant definitions with base classes
TypeScript interface extending HTML attributes
forwardRef component implementation
DisplayName assignment
Named exports
9. Default Styling by Component Type
UI Components:

Base: inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50
Form Components:

Variants: default, filled, outlined
Focus on input styling patterns
Navigation Components:

Variants: default, pills, underline
Navigation-specific interactions
Feedback Components:

Variants: default, success, warning, error
Status-based color schemes
Layout Components:

Variants: default, bordered, elevated
Structural styling patterns
Data Display Components:

Variants: default, bordered, striped
Table and list styling patterns
10. Validation Options
Strict Mode (default: true):

Enforces all shadcn/ui compliance rules
Blocks generation if validation fails
Validation Response:

tsx
{
  isValid: boolean;
  issues: string[];           // Blocking errors
  warnings: string[];         // Non-blocking recommendations
  shadcnCompliant: boolean;   // Full compliance check
  summary: {
    componentName: string;
    componentType: string;
    totalVariants: number;
    totalSizes: number;
    hasConflicts: boolean;
  }
}
11. Performance Guidelines
Recommendations:

Limit custom variants to ≤ 8 for optimal bundle size
Limit custom sizes to ≤ 6 for design consistency
Keep style strings under recommended character limits
Avoid overly complex base class combinations
12. Naming Conflict Handling
Reserved Names Check:

Warning for conflicts with existing components: button, card, input, label, select, textarea, checkbox, radio
Suggests prefixing with custom- for conflicting names
13. Demo Generation Rules
Auto-generated Demo:

Creates functional demo with all variants
Uses default content patterns
Includes size variations
Follows component naming conventions
Generated as separate demo file
This comprehensive rule set ensures that all generated components maintain strict compatibility with the shadcn/ui design system while allowing for customization within defined boundaries.