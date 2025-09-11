# 🎯 Shadcn/UI Component Creation with Strict Architecture Compliance

## Overview

This MCP server creates **new shadcn/ui components** that **strictly follow the official shadcn/ui architecture patterns** and conventions. Every generated component is guaranteed to be production-ready and fully compliant with shadcn/ui standards.

## 🛡️ Strict Architecture Enforcement

### ✅ **Mandatory Architecture Patterns**
- **React.forwardRef** - All components use forwardRef for proper ref forwarding
- **Class Variance Authority (CVA)** - Type-safe variant system with `cva()`
- **Radix UI Slot** - Composition pattern with `asChild` prop support
- **cn() Utility** - Proper class merging with clsx/tailwind-merge
- **Semantic Design Tokens** - Uses shadcn's official color system
- **TypeScript Interfaces** - Complete prop definitions with VariantProps

### 🏗️ **Component Structure**
Every generated component follows this exact structure:
```typescript
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const componentVariants = cva(/* shadcn classes */)
export interface ComponentProps extends React.ElementProps, VariantProps<typeof componentVariants> {
  asChild?: boolean
}
const Component = React.forwardRef<HTMLElement, ComponentProps>(/* implementation */)
Component.displayName = "Component"
export { Component, componentVariants }
```

## 🎨 **Validation & Compliance**

### **Component Naming**
- ✅ **Enforced Pattern**: `kebab-case` only (e.g., `custom-button`, `data-table`)
- ❌ **Rejected**: PascalCase, camelCase, underscores, or invalid characters

### **Component Types**
- ✅ **Allowed**: `ui`, `layout`, `form`, `navigation`, `feedback`, `data-display`
- ❌ **Rejected**: Any custom or non-standard component types

### **Custom Variants & Sizes**
- ✅ **Pattern**: `^[a-z][a-z-]*$` (lowercase with hyphens only)
- ✅ **Limits**: Maximum 8 variants, maximum 6 sizes
- ✅ **Validation**: Automatic conflict detection with default variants

## 🚀 **Component Creation**

### **Basic Usage**
```javascript
await toolHandlers.create_component({
  componentName: 'status-card',
  componentType: 'feedback',
  description: 'A status card component',
  includeDemo: true,
  strictMode: true  // Enforces strict shadcn/ui compliance
});
```

### **With Custom Variants**
```javascript
await toolHandlers.create_component({
  componentName: 'alert-badge',
  componentType: 'feedback',
  customVariants: ['info', 'warning', 'error', 'success'],
  customSizes: ['compact', 'comfortable'],
  strictMode: true
});
```

## 📋 **Generated Files**

Each component creation produces:
- **Component File**: `.tsx` file with complete shadcn/ui implementation
- **TypeScript Types**: Proper interface definitions
- **Demo File**: Working examples showcasing all variants
- **Metadata**: Compliance report and validation summary

## 🔒 **Quality Guarantees**

### **100% Shadcn/UI Compliance**
- All components pass strict validation checks
- Automatic rejection of non-compliant patterns
- Comprehensive error messages for any violations

### **Production Ready**
- Complete TypeScript support
- Proper accessibility patterns
- Semantic HTML structure
- Consistent styling approach

### **Framework Standards**
- Works seamlessly with Next.js, Vite, and other React setups
- Compatible with shadcn/ui CLI and existing components
- Follows official shadcn/ui file structure and naming

## ⚡ **Key Benefits**

- **🎯 Zero Configuration** - Works out of the box
- **🛡️ Error Prevention** - Strict validation prevents mistakes
- **📦 Consistent Output** - Every component follows exact same patterns
- **🔧 Developer Friendly** - Full TypeScript and IDE support
- **🎨 Design System Ready** - Integrates perfectly with existing shadcn/ui projects

## 🚫 **What Cannot Be Created**

This system **will not** create:
- ❌ Random or non-standard components
- ❌ Components that violate shadcn/ui patterns
- ❌ Components with invalid naming conventions
- ❌ Components without proper TypeScript types
- ❌ Components missing forwardRef or asChild support

---

**Result**: Every component created is guaranteed to be **architecture-compliant**, **production-ready**, and **indistinguishable from official shadcn/ui components**.