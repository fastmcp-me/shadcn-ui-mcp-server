import { logInfo, logWarning } from './logger.js';

/**
 * Validate component name according to shadcn/ui conventions
 */
export function validateComponentName(name: string): boolean {
  // Must be lowercase, can contain letters, numbers, and hyphens
  // Must start with a letter, cannot end with hyphen
  const pattern = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;
  return pattern.test(name) && name.length >= 2 && name.length <= 50;
}

/**
 * Convert kebab-case to PascalCase
 */
function toPascalCase(str: string): string {
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}

/**
 * Convert kebab-case to camelCase
 */
function toCamelCase(str: string): string {
  const pascal = toPascalCase(str);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

/**
 * Extract imports and interfaces from base component
 */
function extractBaseComponentPatterns(baseCode: string) {
  const patterns = {
    imports: [] as string[],
    interfaces: [] as string[],
    forwardRef: baseCode.includes('forwardRef'),
    variants: baseCode.includes('cva(') || baseCode.includes('clsx('),
    cn: baseCode.includes('cn(')
  };

  // Extract imports
  const importRegex = /import\s+.*?from\s+['"][^'"]+['"];?/g;
  const imports = baseCode.match(importRegex);
  if (imports) {
    patterns.imports = imports.filter(imp => 
      !imp.includes('./') && !imp.includes('../') // Exclude relative imports
    );
  }

  // Extract interfaces
  const interfaceRegex = /interface\s+\w+[^{]*\{[^}]*\}/g;
  const interfaces = baseCode.match(interfaceRegex);
  if (interfaces) {
    patterns.interfaces = interfaces;
  }

  return patterns;
}

/**
 * Generate component code based on type and base component
 */
export function generateComponentCode({
  componentName,
  componentType = 'ui',
  baseComponentCode = '',
  description
}: {
  componentName: string;
  componentType?: string;
  baseComponentCode?: string;
  description?: string;
}): string {
  const pascalName = toPascalCase(componentName);
  const patterns = baseComponentCode ? extractBaseComponentPatterns(baseComponentCode) : {
    imports: [],
    interfaces: [],
    forwardRef: true,
    variants: true,
    cn: true
  };

  // Basic imports that most components need
  const basicImports = [
    'import * as React from "react"',
    'import { Slot } from "@radix-ui/react-slot"',
    'import { cva, type VariantProps } from "class-variance-authority"',
    'import { cn } from "@/lib/utils"'
  ];

  // Merge with base component imports
  const allImports = [...new Set([...basicImports, ...patterns.imports])];

  // Generate variants based on component type
  const variantsByType = {
    ui: {
      variant: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
      size: ['default', 'sm', 'lg', 'icon']
    },
    form: {
      variant: ['default', 'filled', 'outlined'],
      size: ['default', 'sm', 'lg']
    },
    navigation: {
      variant: ['default', 'pills', 'underline'],
      size: ['default', 'sm', 'lg']
    },
    feedback: {
      variant: ['default', 'success', 'warning', 'error'],
      size: ['default', 'sm', 'lg']
    },
    layout: {
      variant: ['default', 'bordered', 'elevated'],
      size: ['default', 'sm', 'lg', 'xl']
    },
    'data-display': {
      variant: ['default', 'bordered', 'striped'],
      size: ['default', 'sm', 'lg']
    }
  };

  const variants = variantsByType[componentType as keyof typeof variantsByType] || variantsByType.ui;

  const componentCode = `${allImports.join('\n')}

const ${componentName}Variants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        ${variants.variant.map(v => `${v}: "${getVariantClasses(v, componentType)}"`).join(',\n        ')}
      },
      size: {
        ${variants.size.map(s => `${s}: "${getSizeClasses(s)}"`).join(',\n        ')}
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ${pascalName}Props
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof ${componentName}Variants> {
  asChild?: boolean
}

const ${pascalName} = React.forwardRef<HTMLButtonElement, ${pascalName}Props>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(${componentName}Variants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
${pascalName}.displayName = "${pascalName}"

export { ${pascalName}, ${componentName}Variants }`;

  return componentCode;
}

/**
 * Get CSS classes for different variants
 */
function getVariantClasses(variant: string, componentType: string): string {
  const variantMap: Record<string, Record<string, string>> = {
    ui: {
      default: "bg-primary text-primary-foreground hover:bg-primary/90",
      destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
      outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
      secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
      ghost: "hover:bg-accent hover:text-accent-foreground",
      link: "text-primary underline-offset-4 hover:underline"
    },
    form: {
      default: "border border-input bg-background hover:bg-accent",
      filled: "bg-muted hover:bg-muted/80",
      outlined: "border-2 border-primary bg-background hover:bg-primary/5"
    },
    navigation: {
      default: "bg-background hover:bg-accent",
      pills: "bg-muted rounded-full hover:bg-muted/80",
      underline: "bg-transparent border-b-2 border-transparent hover:border-primary"
    },
    feedback: {
      default: "bg-background border border-border",
      success: "bg-green-50 text-green-900 border border-green-200",
      warning: "bg-yellow-50 text-yellow-900 border border-yellow-200",
      error: "bg-red-50 text-red-900 border border-red-200"
    },
    layout: {
      default: "bg-background",
      bordered: "bg-background border border-border",
      elevated: "bg-background shadow-md"
    },
    'data-display': {
      default: "bg-background",
      bordered: "bg-background border border-border",
      striped: "bg-background even:bg-muted/50"
    }
  };

  return variantMap[componentType]?.[variant] || variantMap.ui.default;
}

/**
 * Get CSS classes for different sizes
 */
function getSizeClasses(size: string): string {
  const sizeMap: Record<string, string> = {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-md px-3",
    lg: "h-11 rounded-md px-8",
    xl: "h-12 rounded-md px-10",
    icon: "h-10 w-10"
  };

  return sizeMap[size] || sizeMap.default;
}

/**
 * Generate demo code for the component
 */
export function generateComponentDemo({
  componentName,
  componentType = 'ui',
  description
}: {
  componentName: string;
  componentType?: string;
  description?: string;
}): string {
  const pascalName = toPascalCase(componentName);
  
  const demoCode = `import { ${pascalName} } from "@/registry/new-york-v4/ui/${componentName}"

export default function ${pascalName}Demo() {
  return (
    <div className="flex items-center space-x-4">
      <${pascalName}>Default</${pascalName}>
      <${pascalName} variant="secondary">Secondary</${pascalName}>
      <${pascalName} variant="outline">Outline</${pascalName}>
      <${pascalName} variant="ghost">Ghost</${pascalName}>
      <${pascalName} size="sm">Small</${pascalName}>
      <${pascalName} size="lg">Large</${pascalName}>
    </div>
  )
}`;

  return demoCode;
}

/**
 * Generate TypeScript interface for component props
 */
export function generateComponentInterface(componentName: string, baseCode?: string): string {
  const pascalName = toPascalCase(componentName);
  
  return `export interface ${pascalName}Props
  extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Change the default rendered element for the one passed as a child, merging their props and behavior.
   */
  asChild?: boolean
  /**
   * The visual style variant of the component
   */
  variant?: "default" | "secondary" | "outline" | "ghost"
  /**
   * The size of the component
   */
  size?: "default" | "sm" | "lg"
}`;
}