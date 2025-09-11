import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const compliance-test-buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        brand: "bg-blue-600 text-white hover:bg-blue-700",
        success: "bg-green-600 text-white hover:bg-green-700",
        warning: "bg-yellow-600 text-white hover:bg-yellow-700"
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
        xs: "h-6 px-2 text-xs",
        xxl: "h-14 px-8 text-lg"
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
    // Enhanced quality assurance layer - validate variant and size combinations
    compoundVariants: [
      {
        variant: "destructive",
        size: "icon",
        class: "h-10 w-10"
      },
      {
        variant: "outline",
        size: "icon",
        class: "h-10 w-10"
      },
      {
        variant: "secondary",
        size: "icon",
        class: "h-10 w-10"
      },
      {
        variant: "ghost",
        size: "icon",
        class: "h-10 w-10"
      },
      {
        variant: "link",
        size: "icon",
        class: "h-10 w-10"
      },
      {
        variant: "brand",
        size: "icon",
        class: "h-10 w-10"
      },
      {
        variant: "success",
        size: "icon",
        class: "h-10 w-10"
      },
      {
        variant: "warning",
        size: "icon",
        class: "h-10 w-10"
      }
    ]
  }
)

export interface ComplianceTestButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof compliance-test-buttonVariants> {
  /**
   * Change the default rendered element for the one passed as a child, merging their props and behavior.
   * @default false
   */
  asChild?: boolean
}

const ComplianceTestButton = React.forwardRef<HTMLButtonElement, ComplianceTestButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    // Enhanced error checking in generated code
    // Validate props before rendering
    if (process.env.NODE_ENV === 'development') {
      // Check for valid variant
      const validVariants = ["default", "destructive", "outline", "secondary", "ghost", "link", "brand", "success", "warning"];
      if (variant && !validVariants.includes(variant)) {
        console.warn(`Invalid variant "${variant}" for ComplianceTestButton. Valid variants are: ${validVariants.join(', ')}`);
      }
      
      // Check for valid size
      const validSizes = ["default", "sm", "lg", "icon", "xs", "xxl"];
      if (size && !validSizes.includes(size)) {
        console.warn(`Invalid size "${size}" for ComplianceTestButton. Valid sizes are: ${validSizes.join(', ')}`);
      }
    }
    
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(compliance-test-buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
ComplianceTestButton.displayName = "ComplianceTestButton"

export { ComplianceTestButton, compliance-test-buttonVariants }