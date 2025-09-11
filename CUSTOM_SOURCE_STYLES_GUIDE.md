# 🎨 Custom Source Styles Guide

## Overview

The `generateComponentCode` function now supports **custom source styles** that allow you to completely override the default shadcn/ui styling while maintaining the strict architectural patterns. This enables you to create components with unique visual themes while preserving shadcn/ui compliance.

## 🛠️ Usage

### Basic Structure

```javascript
await toolHandlers.create_component({
  componentName: 'my-component',
  componentType: 'ui',
  customSourceStyles: {
    baseClasses: 'your-custom-base-classes',
    variantStyles: {
      'variant-name': 'variant-specific-classes',
      // ... more variants
    },
    sizeStyles: {
      'size-name': 'size-specific-classes', 
      // ... more sizes
    }
  },
  // ... other parameters
});
```

## 📋 Parameters

### `customSourceStyles` Object

| Property | Type | Description |
|----------|------|-------------|
| `baseClasses` | `string` | Custom CSS classes that replace the default shadcn base classes |
| `variantStyles` | `Record<string, string>` | Custom CSS classes for specific variants |
| `sizeStyles` | `Record<string, string>` | Custom CSS classes for specific sizes |

## 🎯 Examples

### 1. Glass Morphism Theme

```javascript
customSourceStyles: {
  baseClasses: "inline-flex items-center justify-center backdrop-blur-md bg-white/10 border border-white/20 rounded-xl shadow-lg transition-all duration-300 hover:bg-white/20 active:scale-95",
  variantStyles: {
    primary: "bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-blue-300/30 text-blue-100",
    secondary: "bg-gradient-to-r from-gray-500/20 to-slate-500/20 border-gray-300/30 text-gray-100"
  },
  sizeStyles: {
    sm: "h-8 px-3 text-xs rounded-lg",
    lg: "h-12 px-6 text-base rounded-xl"
  }
}
```

### 2. Material Design Theme

```javascript
customSourceStyles: {
  baseClasses: "block bg-white rounded-lg shadow-sm border border-gray-200 transition-shadow duration-200 hover:shadow-md focus-within:shadow-lg",
  variantStyles: {
    elevated: "shadow-lg hover:shadow-xl bg-white",
    outlined: "border-2 border-gray-300 shadow-none hover:shadow-sm bg-transparent",
    filled: "bg-gray-50 border-none shadow-none hover:bg-gray-100"
  },
  sizeStyles: {
    compact: "p-3 rounded-md",
    comfortable: "p-6 rounded-lg",
    spacious: "p-8 rounded-xl"
  }
}
```

### 3. Cyberpunk/Neon Theme

```javascript
customSourceStyles: {
  baseClasses: "relative p-4 border-2 bg-black/90 backdrop-blur text-green-400 font-mono text-sm before:absolute before:inset-0 before:border-2 before:border-green-400/50 before:animate-pulse",
  variantStyles: {
    info: "border-cyan-400 text-cyan-400 before:border-cyan-400/50 bg-cyan-900/20",
    warning: "border-yellow-400 text-yellow-400 before:border-yellow-400/50 bg-yellow-900/20",
    error: "border-red-400 text-red-400 before:border-red-400/50 bg-red-900/20"
  },
  sizeStyles: {
    compact: "p-2 text-xs",
    expanded: "p-6 text-base"
  }
}
```

## 🔄 How It Works

### 1. Base Classes Override
When `customSourceStyles.baseClasses` is provided, it completely replaces the default shadcn/ui base classes:

```typescript
// Default (without custom styles)
const baseClasses = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

// With custom styles
const baseClasses = customSourceStyles?.baseClasses || defaultClasses;
```

### 2. Variant Styles Override
For each variant, the system checks for custom styles first, then falls back to defaults:

```typescript
finalVariants.variant.map(v => {
  const customStyle = customSourceStyles?.variantStyles?.[v];
  const style = customStyle || getVariantClasses(v, componentType);
  return `${v}: "${style}"`;
})
```

### 3. Size Styles Override
Same priority system applies to sizes:

```typescript
finalVariants.size.map(s => {
  const customStyle = customSourceStyles?.sizeStyles?.[s];
  const style = customStyle || getSizeClasses(s);
  return `${s}: "${style}"`;
})
```

## 📝 Generated Component Example

With custom glass morphism styles, the generated component looks like:

```typescript
const glassButtonVariants = cva(
  "inline-flex items-center justify-center backdrop-blur-md bg-white/10 border border-white/20 rounded-xl shadow-lg transition-all duration-300 hover:bg-white/20 active:scale-95",
  {
    variants: {
      variant: {
        primary: "bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-blue-300/30 text-blue-100",
        secondary: "bg-gradient-to-r from-gray-500/20 to-slate-500/20 border-gray-300/30 text-gray-100"
      },
      size: {
        sm: "h-8 px-3 text-xs rounded-lg",
        default: "h-10 px-4 text-sm rounded-xl",
        lg: "h-12 px-6 text-base rounded-xl"
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)
```

## ✅ Maintained Shadcn/UI Compliance

Even with custom source styles, the component maintains:
- ✅ **React.forwardRef** pattern
- ✅ **CVA (Class Variance Authority)** structure
- ✅ **Radix UI Slot** with asChild prop
- ✅ **TypeScript interfaces** with proper typing
- ✅ **Component architecture** standards

## 🎯 Use Cases

### Design Systems
- **Corporate Branding**: Match your company's visual identity
- **Theme Variations**: Dark mode, light mode, high contrast
- **Platform Specific**: Mobile, desktop, or app-specific styling

### Visual Themes
- **Glass Morphism**: Transparent, blurred backgrounds
- **Neumorphism**: Soft, embossed button effects  
- **Material Design**: Google's Material Design principles
- **Cyberpunk**: Neon colors, grid patterns, futuristic aesthetics
- **Minimalist**: Clean, simple, content-focused designs

### Accessibility
- **High Contrast**: Enhanced visibility for accessibility
- **Large Text**: Improved readability
- **Color Blind Friendly**: Alternative color schemes

## ⚠️ Best Practices

1. **Maintain Consistency**: Use consistent spacing, typography, and color schemes
2. **Preserve Functionality**: Ensure interactive states (hover, focus, active) are maintained
3. **Test Accessibility**: Verify contrast ratios and keyboard navigation
4. **Responsive Design**: Include responsive utilities where needed
5. **Performance**: Avoid overly complex CSS that impacts performance

## 🚀 Testing Your Styles

Use the provided test script to verify your custom styles:

```bash
node test-custom-source-styles.js
```

This will generate components with different themes and show how the custom styles are applied throughout the process.

The custom source styles feature gives you complete control over the visual appearance while maintaining the robust architecture and patterns that make shadcn/ui components so reliable and maintainable!