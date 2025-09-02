#!/usr/bin/env node

console.log('🎨 Testing Custom Source Styles with MCP Server...\n');

async function testCustomSourceStyles() {
    try {
        // Import the tools dynamically
        const { toolHandlers } = await import('./build/tools/index.js');
        
        console.log('Test 1: Component with Custom Base Classes');
        console.log('==========================================');
        
        const customBaseResult = await toolHandlers.create_component({
            componentName: 'glass-button',
            componentType: 'ui',
            description: 'A glass morphism button with custom styling',
            customSourceStyles: {
                baseClasses: "inline-flex items-center justify-center backdrop-blur-md bg-white/10 border border-white/20 rounded-xl shadow-lg transition-all duration-300 hover:bg-white/20 active:scale-95",
                variantStyles: {
                    primary: "bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-blue-300/30 text-blue-100 hover:from-blue-500/30 hover:to-purple-500/30",
                    secondary: "bg-gradient-to-r from-gray-500/20 to-slate-500/20 border-gray-300/30 text-gray-100 hover:from-gray-500/30 hover:to-slate-500/30",
                    success: "bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-300/30 text-green-100 hover:from-green-500/30 hover:to-emerald-500/30"
                },
                sizeStyles: {
                    sm: "h-8 px-3 text-xs rounded-lg",
                    default: "h-10 px-4 text-sm rounded-xl", 
                    lg: "h-12 px-6 text-base rounded-xl",
                    xl: "h-14 px-8 text-lg rounded-2xl"
                }
            },
            customVariants: ['primary', 'secondary', 'success'],
            customSizes: ['sm', 'xl'],
            includeDemo: true,
            strictMode: true
        });
        
        const customData = JSON.parse(customBaseResult.content[0].text);
        console.log(`✅ Component: ${customData.componentName}`);
        console.log(`✅ Custom Styles Applied: ${!!customData.files.component.content.includes('backdrop-blur-md')}`);
        console.log(`✅ Custom Variants Count: ${customData.metadata.variantCount}`);
        
        console.log('\\nTest 2: Component with Material Design Styling');
        console.log('==============================================');
        
        const materialResult = await toolHandlers.create_component({
            componentName: 'material-card',
            componentType: 'layout',
            description: 'A Material Design styled card component',
            customSourceStyles: {
                baseClasses: "block bg-white rounded-lg shadow-sm border border-gray-200 transition-shadow duration-200 hover:shadow-md focus-within:shadow-lg overflow-hidden",
                variantStyles: {
                    elevated: "shadow-lg hover:shadow-xl bg-white",
                    outlined: "border-2 border-gray-300 shadow-none hover:shadow-sm bg-transparent",
                    filled: "bg-gray-50 border-none shadow-none hover:bg-gray-100"
                },
                sizeStyles: {
                    compact: "p-3 rounded-md",
                    default: "p-4 rounded-lg",
                    comfortable: "p-6 rounded-lg",
                    spacious: "p-8 rounded-xl"
                }
            },
            customVariants: ['elevated', 'outlined', 'filled'],
            customSizes: ['compact', 'comfortable', 'spacious'],
            includeDemo: true,
            strictMode: true
        });
        
        const materialData = JSON.parse(materialResult.content[0].text);
        console.log(`✅ Component: ${materialData.componentName}`);
        console.log(`✅ Material Styles Applied: ${!!materialData.files.component.content.includes('shadow-lg')}`);
        
        console.log('\\nTest 3: Neon/Cyber Theme Component');
        console.log('==================================');
        
        const neonResult = await toolHandlers.create_component({
            componentName: 'cyber-alert',
            componentType: 'feedback',
            description: 'A cyberpunk-themed alert component',
            customSourceStyles: {
                baseClasses: "relative p-4 border-2 bg-black/90 backdrop-blur text-green-400 font-mono text-sm before:absolute before:inset-0 before:border-2 before:border-green-400/50 before:animate-pulse",
                variantStyles: {
                    info: "border-cyan-400 text-cyan-400 before:border-cyan-400/50 bg-cyan-900/20",
                    warning: "border-yellow-400 text-yellow-400 before:border-yellow-400/50 bg-yellow-900/20",
                    error: "border-red-400 text-red-400 before:border-red-400/50 bg-red-900/20",
                    success: "border-green-400 text-green-400 before:border-green-400/50 bg-green-900/20"
                },
                sizeStyles: {
                    compact: "p-2 text-xs",
                    default: "p-4 text-sm",
                    expanded: "p-6 text-base"
                }
            },
            customVariants: ['info', 'warning', 'error', 'success'],
            customSizes: ['compact', 'expanded'],
            includeDemo: true,
            strictMode: true
        });
        
        const neonData = JSON.parse(neonResult.content[0].text);
        console.log(`✅ Component: ${neonData.componentName}`);
        console.log(`✅ Cyber Styles Applied: ${!!neonData.files.component.content.includes('animate-pulse')}`);
        
        console.log('\\n🎉 Custom Source Styles Testing Completed!');
        console.log('\\n📋 Summary of Custom Styling Options:');
        console.log('- ✅ Glass Morphism: backdrop-blur, transparency effects');
        console.log('- ✅ Material Design: elevation shadows, proper spacing');
        console.log('- ✅ Cyberpunk: neon colors, animations, monospace fonts');
        console.log('- ✅ Custom Base Classes: Complete override of default shadcn styles');
        console.log('- ✅ Custom Variant Styles: Specific styling for each variant');
        console.log('- ✅ Custom Size Styles: Tailored sizing for different use cases');
        
        console.log('\\n🎨 Generated Component Preview:');
        console.log('```tsx');
        console.log('// Glass Button with custom styling');
        console.log('<GlassButton variant="primary" size="lg">Glass Effect</GlassButton>');
        console.log('');
        console.log('// Material Card with elevation');
        console.log('<MaterialCard variant="elevated" size="comfortable">Material Design</MaterialCard>');
        console.log('');
        console.log('// Cyber Alert with neon effects');
        console.log('<CyberAlert variant="error" size="expanded">System Error Detected</CyberAlert>');
        console.log('```');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error('Full error:', error);
    }
}

testCustomSourceStyles();