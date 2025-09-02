# Enhanced Create Component Tool Documentation

## 🎯 **Overview**

The enhanced `create_component` MCP tool leverages the `component-generator.ts` utilities to create shadcn/ui compliant components with strict architectural enforcement. This tool prevents AI from generating random or non-compliant components by enforcing shadcn/ui patterns and conventions.

## 🛡️ **Shadcn/ui Compliance Features**

### **Enforced Patterns**
- ✅ **React.forwardRef** - All components use forwardRef for proper ref forwarding
- ✅ **Class Variance Authority (CVA)** - Type-safe variant system with `cva()`
- ✅ **Radix UI Slot** - Composition pattern with `asChild` prop
- ✅ **cn() Utility** - Proper class merging with clsx/tailwind-merge
- ✅ **Semantic Design Tokens** - Uses shadcn's color system
- ✅ **TypeScript Interfaces** - Proper prop definitions with VariantProps

### **Naming Conventions**
- ✅ **Kebab-case** - Component names must be lowercase with hyphens
- ✅ **Length Validation** - 2-50 characters
- ✅ **Pattern Matching** - Must start with letter, no trailing hyphens

### **Component Types**
- ✅ **Restricted Types** - Only allows: `ui`, `layout`, `form`, `navigation`, `feedback`, `data-display`
- ✅ **Type-specific Variants** - Different variant sets per component type
- ✅ **Consistent Sizing** - Standard size scales across all components

## 📋 **Tool Parameters**

```typescript
{
  componentName: string;          // Required: kebab-case name
  componentType?: string;         // Optional: component category
  baseComponent?: string;         // Optional: template component
  description?: string;           // Optional: component description
  includeDemo?: boolean;          // Optional: generate demo file
  customVariants?: string[];      // Optional: additional variants
  customSizes?: string[];         // Optional: additional sizes
  strictMode?: boolean;           // Optional: enforce strict validation
}
```

## 🎨 **Component Types and Their Variants**

### **UI Components** (default)
```typescript
variant: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link']
size: ['default', 'sm', 'lg', 'icon']
```

### **Form Components**
```typescript
variant: ['default', 'filled', 'outlined']
size: ['default', 'sm', 'lg']
```

### **Navigation Components**
```typescript
variant: ['default', 'pills', 'underline']
size: ['default', 'sm', 'lg']
```

### **Feedback Components**
```typescript
variant: ['default', 'success', 'warning', 'error']
size: ['default', 'sm', 'lg']
```

### **Layout Components**
```typescript
variant: ['default', 'bordered', 'elevated']
size: ['default', 'sm', 'lg', 'xl']
```

### **Data Display Components**
```typescript
variant: ['default', 'bordered', 'striped']
size: ['default', 'sm', 'lg']
```

## 🚀 **Usage Examples**

### **Basic Component Creation**
```javascript
await toolHandlers.create_component({
  componentName: 'custom-button',
  componentType: 'ui',
  description: 'A custom button following shadcn patterns'
});
```

### **Advanced Component with Custom Variants**
```javascript
await toolHandlers.create_component({
  componentName: 'status-badge',
  componentType: 'feedback',
  baseComponent: 'badge',
  description: 'Status indicator badge',
  customVariants: ['pending', 'approved', 'rejected'],
  customSizes: ['xs', 'xl'],
  includeDemo: true,
  strictMode: true
});
```

### **Layout Component Example**
```javascript
await toolHandlers.create_component({
  componentName: 'hero-section',
  componentType: 'layout',
  description: 'Hero section layout component',
  customVariants: ['centered', 'left-aligned'],
  includeDemo: true
});
```

## 📁 **Generated Files**

### **Component File Structure**
```
apps/v4/registry/new-york-v4/
├── ui/
│   └── [component-name].tsx          # Main component
├── examples/
│   └── [component-name]-demo.tsx     # Demo file
└── types/
    └── [component-name]-types.ts     # TypeScript interfaces
```

### **Generated Component Template**
```typescript
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const customButtonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        // ... more variants
      },
      size: {
        default: "h-10 px-4 py-2",
        // ... more sizes
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface CustomButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof customButtonVariants> {
  asChild?: boolean
}

const CustomButton = React.forwardRef<HTMLButtonElement, CustomButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(customButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
CustomButton.displayName = "CustomButton"

export { CustomButton, customButtonVariants }
```

## 🛡️ **Validation & Error Handling**

### **Component Name Validation**
- ❌ `MyComponent` - Must be kebab-case
- ❌ `my_component` - No underscores allowed
- ❌ `component-` - Cannot end with hyphen
- ❌ `123component` - Must start with letter
- ✅ `custom-button` - Valid format
- ✅ `data-table` - Valid format
- ✅ `user-profile-card` - Valid format

### **Component Type Validation**
- ❌ `random-type` - Only predefined types allowed
- ❌ `widget` - Not a valid shadcn category
- ✅ `ui` - Standard UI component
- ✅ `form` - Form-related component
- ✅ `navigation` - Navigation component

### **Custom Variant Validation**
- ❌ `MyVariant` - Must be lowercase
- ❌ `variant_name` - No underscores
- ✅ `custom-variant` - Valid format
- ✅ `special` - Valid format

## 🎯 **Benefits for AI Integration**

### **1. Prevents Random Generation**
- Strict naming conventions prevent invalid component names
- Component types are restricted to shadcn categories
- Variants follow consistent patterns

### **2. Ensures Design System Compliance**
- All components use semantic design tokens
- Consistent sizing scales across components
- Proper accessibility patterns enforced

### **3. Maintains Code Quality**
- TypeScript interfaces for type safety
- forwardRef pattern for ref forwarding
- Composition patterns with asChild prop

### **4. Development Experience**
- Auto-completion friendly prop names
- Consistent API across all components
- Demo files for testing and documentation

## 📊 **Response Metadata**

The tool returns comprehensive metadata about the generated component:

```json
{
  "componentName": "custom-button",
  "componentType": "ui",
  "success": true,
  "metadata": {
    "shadcnCompliant": true,
    "framework": "React",
    "typescript": true,
    "baseComponent": "button",
    "strictMode": true,
    "hasCustomVariants": false,
    "variantCount": 0
  },
  "shadcnPatterns": {
    "forwardRef": true,
    "variantSystem": true,
    "classVarianceAuthority": true,
    "radixSlot": true,
    "cnUtility": true,
    "semanticTokens": true
  }
}
```

## 🔧 **Integration with MCP Server**

The tool is automatically registered in the MCP server and available as:

- **Tool Name**: `create_component`
- **Description**: "Create a new shadcn/ui component following existing patterns and conventions"
- **Validation**: Full parameter validation with helpful error messages
- **Logging**: Comprehensive logging for debugging and monitoring

This enhanced tool ensures that AI-generated components are always production-ready and follow shadcn/ui architecture perfectly! 🚀