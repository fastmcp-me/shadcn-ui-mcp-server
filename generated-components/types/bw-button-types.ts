export interface BwButtonProps
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
}