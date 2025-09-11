import { PinkButton } from "@/registry/new-york-v4/ui/pink-button"

export default function PinkButtonDemo() {
  return (
    <div className="flex items-center space-x-4">
      <PinkButton>Default</PinkButton>
      <PinkButton variant="secondary">Secondary</PinkButton>
      <PinkButton variant="outline">Outline</PinkButton>
      <PinkButton variant="ghost">Ghost</PinkButton>
      <PinkButton size="sm">Small</PinkButton>
      <PinkButton size="lg">Large</PinkButton>
    </div>
  )
}