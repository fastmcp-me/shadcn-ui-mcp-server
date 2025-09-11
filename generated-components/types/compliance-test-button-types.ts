import { VariantProps } from "class-variance-authority"

export interface ComplianceTestButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof compliance-test-buttonVariants> {
  /**
   * Change the default rendered element for the one passed as a child, merging their props and behavior.
   * @default false
   */
  asChild?: boolean
}

// Type definitions for better IntelliSense
export type ComplianceTestButtonVariant = "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "brand" | "success" | "warning";
export type ComplianceTestButtonSize = "default" | "sm" | "lg" | "icon" | "xs" | "xxl";
