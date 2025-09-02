import { BwButton } from "./bw-button-corrected"

export default function BwButtonDemo() {
  return (
    <div className="flex flex-col items-center space-y-4 p-8">
      <h2 className="text-2xl font-bold">Black & White Button Variants</h2>
      
      <div className="flex flex-wrap items-center justify-center gap-4">
        <BwButton>Black Button</BwButton>
        <BwButton variant="white">White Button</BwButton>
        <BwButton variant="bw-outline">BW Outline</BwButton>
        <BwButton variant="bw-ghost">BW Ghost</BwButton>
      </div>
      
      <div className="flex flex-wrap items-center justify-center gap-4">
        <BwButton size="sm" variant="black">Small Black</BwButton>
        <BwButton size="sm" variant="white">Small White</BwButton>
        <BwButton size="sm" variant="bw-outline">Small Outline</BwButton>
      </div>
      
      <div className="flex flex-wrap items-center justify-center gap-4">
        <BwButton size="lg" variant="black">Large Black</BwButton>
        <BwButton size="lg" variant="white">Large White</BwButton>
        <BwButton size="lg" variant="bw-outline">Large Outline</BwButton>
      </div>
    </div>
  )
}