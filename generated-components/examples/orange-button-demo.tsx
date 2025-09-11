import { OrangeButton } from "@/registry/new-york-v4/ui/orange-button"

export default function OrangeButtonDemo() {
  return (
    <div className="flex items-center space-x-4">
      <OrangeButton>Default</OrangeButton>
      <OrangeButton variant="secondary">Secondary</OrangeButton>
      <OrangeButton variant="outline">Outline</OrangeButton>
      <OrangeButton variant="ghost">Ghost</OrangeButton>
      <OrangeButton size="sm">Small</OrangeButton>
      <OrangeButton size="lg">Large</OrangeButton>
    </div>
  )
}