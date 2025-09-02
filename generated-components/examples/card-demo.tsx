import { Card } from "@/registry/new-york-v4/ui/card"

export default function CardDemo() {
  return (
    <div className="flex items-center space-x-4">
      <Card>Default</Card>
      <Card variant="secondary">Secondary</Card>
      <Card variant="outline">Outline</Card>
      <Card variant="ghost">Ghost</Card>
      <Card size="sm">Small</Card>
      <Card size="lg">Large</Card>
    </div>
  )
}