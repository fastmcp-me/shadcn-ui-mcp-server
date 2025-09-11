import { ComplianceTestButton } from "@/registry/new-york-v4/ui/compliance-test-button"

export default function ComplianceTestButtonDemo() {
  return (
    <div className="flex items-center space-x-4">
      <ComplianceTestButton>Default</ComplianceTestButton>
      <ComplianceTestButton variant="secondary">Secondary</ComplianceTestButton>
      <ComplianceTestButton variant="outline">Outline</ComplianceTestButton>
      <ComplianceTestButton variant="ghost">Ghost</ComplianceTestButton>
      <ComplianceTestButton size="sm">Small</ComplianceTestButton>
      <ComplianceTestButton size="lg">Large</ComplianceTestButton>
    </div>
  )
}