import { BwButton } from "@/registry/new-york-v4/ui/bw-button"

export default function BwButtonDemo() {
  return (
    <div className="flex items-center space-x-4">
      <BwButton>Default</BwButton>
      <BwButton variant="secondary">Secondary</BwButton>
      <BwButton variant="outline">Outline</BwButton>
      <BwButton variant="ghost">Ghost</BwButton>
      <BwButton size="sm">Small</BwButton>
      <BwButton size="lg">Large</BwButton>
    </div>
  )
}