#!/usr/bin/env node

console.log('🎯 Simple Custom Source Styles Example...\n');

async function simpleExample() {
    try {
        const { toolHandlers } = await import('./build/tools/index.js');
        
        console.log('Creating a custom-styled button component...');
        
        const result = await toolHandlers.create_component({
            componentName: 'neon-button',
            componentType: 'ui',
            description: 'A neon-styled button with custom appearance',
            
            // 🎨 CUSTOM SOURCE STYLES - This is where you define your styles
            customSourceStyles: {
                // Base classes that apply to all variants/sizes
                baseClasses: "inline-flex items-center justify-center font-bold uppercase tracking-wide border-2 transition-all duration-300 transform hover:scale-105 active:scale-95",
                
                // Custom styles for each variant
                variantStyles: {
                    neon: "bg-black border-cyan-400 text-cyan-400 shadow-lg shadow-cyan-400/50 hover:shadow-xl hover:shadow-cyan-400/75",
                    fire: "bg-black border-red-500 text-red-500 shadow-lg shadow-red-500/50 hover:shadow-xl hover:shadow-red-500/75",
                    toxic: "bg-black border-green-400 text-green-400 shadow-lg shadow-green-400/50 hover:shadow-xl hover:shadow-green-400/75"
                },
                
                // Custom styles for each size
                sizeStyles: {
                    sm: "px-3 py-1 text-xs rounded-sm",
                    default: "px-6 py-2 text-sm rounded-md",
                    lg: "px-8 py-3 text-base rounded-lg",
                    xl: "px-12 py-4 text-lg rounded-xl"
                }
            },
            
            // Define which variants and sizes to include
            customVariants: ['neon', 'fire', 'toxic'],
            customSizes: ['sm', 'xl'],
            
            includeDemo: true,
            strictMode: true
        });
        
        const data = JSON.parse(result.content[0].text);
        
        console.log('✅ Custom styled component created successfully!');
        console.log(`📦 Component: ${data.componentName}`);
        console.log(`🎨 Custom styles applied: ${data.files.component.content.includes('shadow-cyan-400')}`);
        
        console.log('\n📝 Generated Component Code Preview:');
        console.log('=====================================');
        
        // Show a preview of the generated code
        const componentCode = data.files.component.content;
        const lines = componentCode.split('\n');
        const cvaStart = lines.findIndex(line => line.includes('cva('));
        const cvaEnd = lines.findIndex((line, index) => index > cvaStart && line.includes('})'));
        
        if (cvaStart !== -1 && cvaEnd !== -1) {
            console.log(lines.slice(cvaStart, cvaEnd + 1).join('\n'));
        }
        
        console.log('\n🚀 Usage Example:');
        console.log('```tsx');
        console.log('<NeonButton variant="neon" size="lg">Neon Glow</NeonButton>');
        console.log('<NeonButton variant="fire" size="xl">Fire Effect</NeonButton>');
        console.log('<NeonButton variant="toxic" size="sm">Toxic Style</NeonButton>');
        console.log('```');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

simpleExample();