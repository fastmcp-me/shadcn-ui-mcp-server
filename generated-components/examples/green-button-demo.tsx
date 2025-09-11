import { GreenButton } from "@/registry/new-york-v4/ui/green-button"

export default function GreenButtonDemo() {
  return (
    <div className="flex items-center space-x-4">
      <GreenButton>Default</GreenButton>
      <GreenButton variant="secondary">Secondary</GreenButton>
      <GreenButton variant="outline">Outline</GreenButton>
      <GreenButton variant="ghost">Ghost</GreenButton>
      <GreenButton size="sm">Small</GreenButton>
      <GreenButton size="lg">Large</GreenButton>
    </div>
  )
}