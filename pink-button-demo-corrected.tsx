import { PinkButton } from "@/registry/new-york-v4/ui/pink-button"

export default function PinkButtonDemo() {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <PinkButton variant="pink">Pink</PinkButton>
      <PinkButton variant="dark-pink">Dark Pink</PinkButton>
      <PinkButton variant="pink-outline">Pink Outline</PinkButton>
      <PinkButton variant="pink-ghost">Pink Ghost</PinkButton>
      <PinkButton variant="pink" size="sm">Small Pink</PinkButton>
      <PinkButton variant="pink" size="lg">Large Pink</PinkButton>
    </div>
  )
}