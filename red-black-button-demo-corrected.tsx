import { RedBlackButton } from "./red-black-button-corrected"

export default function RedBlackButtonDemo() {
  return (
    <div className="flex flex-col items-center space-y-4 p-8">
      <h2 className="text-2xl font-bold">Red & Black Button Variants</h2>
      
      <div className="flex flex-wrap items-center justify-center gap-4">
        <RedBlackButton>Red Button</RedBlackButton>
        <RedBlackButton variant="black">Black Button</RedBlackButton>
        <RedBlackButton variant="red-outline">Red Outline</RedBlackButton>
        <RedBlackButton variant="red-ghost">Red Ghost</RedBlackButton>
      </div>
      
      <div className="flex flex-wrap items-center justify-center gap-4">
        <RedBlackButton size="sm" variant="red">Small Red</RedBlackButton>
        <RedBlackButton size="sm" variant="black">Small Black</RedBlackButton>
        <RedBlackButton size="sm" variant="red-outline">Small Outline</RedBlackButton>
      </div>
      
      <div className="flex flex-wrap items-center justify-center gap-4">
        <RedBlackButton size="lg" variant="red">Large Red</RedBlackButton>
        <RedBlackButton size="lg" variant="black">Large Black</RedBlackButton>
        <RedBlackButton size="lg" variant="red-outline">Large Outline</RedBlackButton>
      </div>
    </div>
  )
}