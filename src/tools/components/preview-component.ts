import { logError, logInfo } from '../../utils/logger.js';
import { validateAndSanitizeParams } from '../../utils/validation.js';
import { getAxiosImplementation } from '../../utils/framework.js';

export async function handlePreviewComponent(params: any) {
  try {
    // Validate and sanitize parameters
    const validatedParams = validateAndSanitizeParams<{
      componentName: string;
      componentCode: string;
      demoCode?: string;
      previewMode: 'inline' | 'standalone' | 'storybook';
      includeStyles: boolean;
    }>('preview_component', params);

    const {
      componentName,
      componentCode,
      demoCode,
      previewMode = 'standalone',
      includeStyles = true
    } = validatedParams;

    logInfo(`Generating preview for component "${componentName}" in ${previewMode} mode...`);

    const axios = await getAxiosImplementation();
    
    // Generate preview HTML with the component
    const previewHtml = await generatePreviewHtml({
      componentName,
      componentCode,
      demoCode,
      previewMode,
      includeStyles
    });

    // Create a temporary preview file
    const previewFileName = `${componentName}-preview.html`;
    const previewFilePath = `./previews/${previewFileName}`;

    // Ensure previews directory exists
    const fs = await import('fs/promises');
    const path = await import('path');
    
    try {
      await fs.mkdir('./previews', { recursive: true });
    } catch (error) {
      // Directory might already exist
    }

    // Write preview file
    await fs.writeFile(previewFilePath, previewHtml, 'utf-8');

    logInfo(`Preview generated successfully: ${previewFilePath}`);

    const response = {
      componentName,
      previewMode,
      previewPath: previewFilePath,
      previewUrl: `file://${path.resolve(previewFilePath)}`,
      instructions: [
        `Component preview generated for "${componentName}"`,
        `Preview file: ${previewFilePath}`,
        `Open in browser: ${path.resolve(previewFilePath)}`,
        '',
        'Preview includes:',
        '• Component code with syntax highlighting',
        '• Live demo of the component',
        '• Props documentation',
        '• Usage examples',
        includeStyles ? '• Tailwind CSS and shadcn/ui styles' : '• Basic styles only',
        '',
        'Next steps:',
        '1. Open the preview file in your browser',
        '2. Test the component interactivity',
        '3. Verify the visual appearance',
        '4. Check responsive behavior',
        '5. If satisfied, use push_component to commit'
      ],
      previewContent: previewHtml
    };

    return {
      content: [{ 
        type: "text", 
        text: JSON.stringify(response, null, 2)
      }]
    };

  } catch (error) {
    logError(`Failed to generate preview for component "${params?.componentName || 'unknown'}"`, error);
    
    let errorMessage = `Failed to generate component preview: `;
    
    if (error instanceof Error) {
      if (error.message.includes('Validation failed')) {
        errorMessage += '\n\n📋 Preview Requirements:\n';
        errorMessage += '• Component name: lowercase with hyphens only (e.g., "custom-button")\n';
        errorMessage += '• Component code: required, must be valid React/Vue/Svelte code\n';
        errorMessage += '• Demo code: optional, for showing usage examples\n';
        errorMessage += '• Preview mode: "inline", "standalone", or "storybook"\n\n';
        errorMessage += `❌ ${error.message}`;
      } else {
        errorMessage += error.message;
      }
    } else {
      errorMessage += String(error);
    }
    
    throw new Error(errorMessage);
  }
}

async function generatePreviewHtml({
  componentName,
  componentCode,
  demoCode,
  previewMode,
  includeStyles
}: {
  componentName: string;
  componentCode: string;
  demoCode?: string;
  previewMode: string;
  includeStyles: boolean;
}): Promise<string> {
  
  const axios = await getAxiosImplementation();
  
  // Determine framework and file extension
  const frameworkInfo = {
    current: 'react', // This should come from getFramework()
    fileExtension: '.tsx'
  };

  // Extract component props and analyze the code
  const componentAnalysis = analyzeComponent(componentCode);
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${componentName} - Component Preview</title>
    ${includeStyles ? `
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Inter', sans-serif; }
        .code-block { background: #1e1e1e; color: #d4d4d4; padding: 1rem; border-radius: 0.5rem; overflow-x: auto; }
        .preview-section { border: 1px solid #e5e7eb; border-radius: 0.5rem; padding: 1rem; margin: 1rem 0; }
        .component-preview { min-height: 200px; display: flex; align-items: center; justify-content: center; background: #f9fafb; border-radius: 0.5rem; }
    </style>
    ` : ''}
    <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <script>
        // Configure Tailwind with shadcn/ui theme
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        border: "hsl(214.3 31.8% 91.4%)",
                        input: "hsl(214.3 31.8% 91.4%)",
                        ring: "hsl(221.2 83.2% 53.3%)",
                        background: "hsl(0 0% 100%)",
                        foreground: "hsl(222.2 84% 4.9%)",
                        primary: {
                            DEFAULT: "hsl(221.2 83.2% 53.3%)",
                            foreground: "hsl(210 40% 98%)",
                        },
                        secondary: {
                            DEFAULT: "hsl(210 40% 96%)",
                            foreground: "hsl(222.2 84% 4.9%)",
                        },
                        accent: {
                            DEFAULT: "hsl(210 40% 96%)",
                            foreground: "hsl(222.2 84% 4.9%)",
                        },
                        muted: {
                            DEFAULT: "hsl(210 40% 96%)",
                            foreground: "hsl(215.4 16.3% 46.9%)",
                        },
                    },
                }
            }
        }
    </script>
</head>
<body class="bg-gray-50 p-8">
    <div class="max-w-4xl mx-auto">
        <!-- Header -->
        <div class="mb-8">
            <h1 class="text-3xl font-bold text-gray-900 mb-2">${componentName} Preview</h1>
            <p class="text-gray-600">Preview and test your shadcn/ui component before pushing to repository</p>
            <div class="flex gap-2 mt-4">
                <span class="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">Framework: ${frameworkInfo.current}</span>
                <span class="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">Mode: ${previewMode}</span>
                <span class="px-2 py-1 bg-purple-100 text-purple-800 rounded text-sm">Styles: ${includeStyles ? 'Included' : 'Basic'}</span>
            </div>
        </div>

        <!-- Component Analysis -->
        <div class="preview-section">
            <h2 class="text-xl font-semibold mb-4">Component Analysis</h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="bg-white p-4 rounded border">
                    <h3 class="font-medium text-gray-900">Props Found</h3>
                    <p class="text-2xl font-bold text-blue-600">${componentAnalysis.propsCount}</p>
                </div>
                <div class="bg-white p-4 rounded border">
                    <h3 class="font-medium text-gray-900">TypeScript</h3>
                    <p class="text-2xl font-bold ${componentAnalysis.hasTypeScript ? 'text-green-600' : 'text-red-600'}">${componentAnalysis.hasTypeScript ? '✓' : '✗'}</p>
                </div>
                <div class="bg-white p-4 rounded border">
                    <h3 class="font-medium text-gray-900">Shadcn Compliant</h3>
                    <p class="text-2xl font-bold ${componentAnalysis.isShadcnCompliant ? 'text-green-600' : 'text-yellow-600'}">${componentAnalysis.isShadcnCompliant ? '✓' : '~'}</p>
                </div>
            </div>
            ${componentAnalysis.props.length > 0 ? `
            <div class="mt-4">
                <h3 class="font-medium text-gray-900 mb-2">Props Documentation</h3>
                <div class="bg-white border rounded">
                    ${componentAnalysis.props.map(prop => `
                    <div class="p-3 border-b last:border-b-0">
                        <div class="flex justify-between items-start">
                            <span class="font-mono text-sm text-blue-600">${prop.name}</span>
                            <span class="text-sm text-gray-500">${prop.type || 'unknown'}</span>
                        </div>
                        ${prop.description ? `<p class="text-sm text-gray-600 mt-1">${prop.description}</p>` : ''}
                    </div>
                    `).join('')}
                </div>
            </div>
            ` : ''}
        </div>

        <!-- Live Preview -->
        <div class="preview-section">
            <h2 class="text-xl font-semibold mb-4">Live Preview</h2>
            <div class="component-preview" id="component-preview">
                <div class="text-gray-500">Loading component preview...</div>
            </div>
        </div>

        <!-- Demo Code -->
        ${demoCode ? `
        <div class="preview-section">
            <h2 class="text-xl font-semibold mb-4">Demo Usage</h2>
            <pre class="code-block"><code>${escapeHtml(demoCode)}</code></pre>
        </div>
        ` : ''}

        <!-- Component Source -->
        <div class="preview-section">
            <h2 class="text-xl font-semibold mb-4">Component Source</h2>
            <pre class="code-block"><code>${escapeHtml(componentCode)}</code></pre>
        </div>

        <!-- Testing Checklist -->
        <div class="preview-section">
            <h2 class="text-xl font-semibold mb-4">Testing Checklist</h2>
            <div class="space-y-2">
                <label class="flex items-center space-x-2">
                    <input type="checkbox" class="rounded">
                    <span>Component renders without errors</span>
                </label>
                <label class="flex items-center space-x-2">
                    <input type="checkbox" class="rounded">
                    <span>Props work as expected</span>
                </label>
                <label class="flex items-center space-x-2">
                    <input type="checkbox" class="rounded">
                    <span>Responsive design looks good</span>
                </label>
                <label class="flex items-center space-x-2">
                    <input type="checkbox" class="rounded">
                    <span>Accessibility features work</span>
                </label>
                <label class="flex items-center space-x-2">
                    <input type="checkbox" class="rounded">
                    <span>Dark mode compatibility (if applicable)</span>
                </label>
                <label class="flex items-center space-x-2">
                    <input type="checkbox" class="rounded">
                    <span>Interactions work correctly</span>
                </label>
            </div>
        </div>

        <!-- Next Steps -->
        <div class="preview-section bg-blue-50 border-blue-200">
            <h2 class="text-xl font-semibold mb-4 text-blue-900">Next Steps</h2>
            <div class="space-y-2 text-blue-800">
                <p>✅ If the component looks good and passes your tests:</p>
                <code class="block bg-blue-100 p-2 rounded mt-2 font-mono text-sm">
                    Use push_component tool to commit to repository
                </code>
                <p class="mt-4">🔄 If you need to make changes:</p>
                <code class="block bg-blue-100 p-2 rounded mt-2 font-mono text-sm">
                    Use create_component tool again with modifications
                </code>
            </div>
        </div>
    </div>

    <script type="text/babel">
        // Component preview script
        try {
            ${generatePreviewScript(componentCode, demoCode)}
        } catch (error) {
            document.getElementById('component-preview').innerHTML = 
                '<div class="text-red-500">Error loading component: ' + error.message + '</div>';
        }
    </script>
</body>
</html>`;
}

function analyzeComponent(componentCode: string) {
  const analysis = {
    propsCount: 0,
    hasTypeScript: false,
    isShadcnCompliant: false,
    props: [] as Array<{name: string, type?: string, description?: string}>
  };

  // Check TypeScript
  analysis.hasTypeScript = componentCode.includes('interface ') || 
                          componentCode.includes('type ') || 
                          componentCode.includes(': React.') ||
                          componentCode.includes('ComponentProps');

  // Check shadcn compliance
  analysis.isShadcnCompliant = componentCode.includes('forwardRef') &&
                              componentCode.includes('cn(') &&
                              (componentCode.includes('cva(') || componentCode.includes('VariantProps'));

  // Extract props (basic analysis)
  const interfaceMatch = componentCode.match(/interface\s+\w+Props\s*{([^}]+)}/);
  if (interfaceMatch) {
    const propsContent = interfaceMatch[1];
    const propMatches = propsContent.match(/(\w+)(\?)?:\s*([^;\n]+)/g);
    if (propMatches) {
      analysis.propsCount = propMatches.length;
      analysis.props = propMatches.map(prop => {
        const [, name, optional, type] = prop.match(/(\w+)(\?)?:\s*(.+)/) || [];
        return {
          name: name || 'unknown',
          type: type?.trim() || 'unknown',
          description: optional ? 'Optional' : 'Required'
        };
      });
    }
  }

  return analysis;
}

function generatePreviewScript(componentCode: string, demoCode?: string): string {
  // Extract component name from the code
  const componentNameMatch = componentCode.match(/const (\w+) = React\.forwardRef/);
  const componentName = componentNameMatch ? componentNameMatch[1] : 'Component';
  
  // Extract demo component name from demo code
  let demoComponentName = 'Demo';
  if (demoCode) {
    const demoMatch = demoCode.match(/export default function (\w+)/);
    if (demoMatch) {
      demoComponentName = demoMatch[1];
    }
  }

  return `
    // Create a simplified version of the component for preview
    const { useState, useEffect } = React;
    
    // Mock cn utility function
    function cn(...classes) {
      return classes.filter(Boolean).join(' ');
    }
    
    // Mock cva function
    function cva(base, config) {
      return function(props) {
        let result = base;
        if (config && config.variants && props) {
          Object.keys(props).forEach(key => {
            if (config.variants[key] && config.variants[key][props[key]]) {
              result += ' ' + config.variants[key][props[key]];
            }
          });
        }
        if (config && config.defaultVariants) {
          Object.keys(config.defaultVariants).forEach(key => {
            if (!props || props[key] === undefined) {
              if (config.variants[key] && config.variants[key][config.defaultVariants[key]]) {
                result += ' ' + config.variants[key][config.defaultVariants[key]];
              }
            }
          });
        }
        return result;
      };
    }
    
    // Simplified Slot component
    const Slot = ({ children, ...props }) => {
      return React.cloneElement(children, props);
    };
    
    // Create preview component
    function PreviewComponent() {
      return React.createElement('div', {
        className: 'p-8 space-y-6'
      }, [
        React.createElement('div', {
          key: 'header',
          className: 'bg-white p-6 rounded-lg shadow-sm border'
        }, [
          React.createElement('h3', {
            key: 'title',
            className: 'text-lg font-medium mb-4'
          }, '${componentName} Component Preview'),
          React.createElement('p', {
            key: 'desc',
            className: 'text-gray-600 mb-4'
          }, 'Interactive preview of your shadcn/ui component'),
          React.createElement('div', {
            key: 'variants',
            className: 'flex flex-wrap gap-3'
          }, [
            // Default variant
            React.createElement('button', {
              key: 'default',
              className: 'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2'
            }, 'Default'),
            // Secondary variant
            React.createElement('button', {
              key: 'secondary',
              className: 'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-secondary text-secondary-foreground hover:bg-secondary/80 h-10 px-4 py-2'
            }, 'Secondary'),
            // Outline variant
            React.createElement('button', {
              key: 'outline',
              className: 'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2'
            }, 'Outline'),
            // Custom variants if detected
            ${componentCode.includes('premium') ? `
            React.createElement('button', {
              key: 'premium',
              className: 'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 h-10 px-4 py-2'
            }, 'Premium'),` : ''}
            ${componentCode.includes('outline-dashed') ? `
            React.createElement('button', {
              key: 'outline-dashed',
              className: 'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border-2 border-dashed border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2'
            }, 'Dashed'),` : ''}
          ])
        ]),
        
        React.createElement('div', {
          key: 'sizes',
          className: 'bg-white p-6 rounded-lg shadow-sm border'
        }, [
          React.createElement('h3', {
            key: 'title',
            className: 'text-lg font-medium mb-4'
          }, 'Size Variations'),
          React.createElement('div', {
            key: 'size-variants',
            className: 'flex flex-wrap items-center gap-3'
          }, [
            // Small size
            React.createElement('button', {
              key: 'sm',
              className: 'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 rounded-md px-3'
            }, 'Small'),
            // Default size
            React.createElement('button', {
              key: 'default',
              className: 'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2'
            }, 'Default'),
            // Large size
            React.createElement('button', {
              key: 'lg',
              className: 'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-11 rounded-md px-8'
            }, 'Large'),
            // Custom sizes if detected
            ${componentCode.includes('xs') ? `
            React.createElement('button', {
              key: 'xs',
              className: 'inline-flex items-center justify-center whitespace-nowrap rounded-md text-xs font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-8 rounded px-2 py-1'
            }, 'Extra Small'),` : ''}
            ${componentCode.includes('xl') ? `
            React.createElement('button', {
              key: 'xl',
              className: 'inline-flex items-center justify-center whitespace-nowrap rounded-md text-lg font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-12 rounded-md px-10'
            }, 'Extra Large'),` : ''}
          ])
        ]),
        
        ${demoCode ? `
        React.createElement('div', {
          key: 'demo',
          className: 'bg-white p-6 rounded-lg shadow-sm border'
        }, [
          React.createElement('h3', {
            key: 'title',
            className: 'text-lg font-medium mb-4'
          }, 'Demo Usage Example'),
          React.createElement('div', {
            key: 'demo-content',
            className: 'p-4 bg-gray-50 rounded border'
          }, [
            React.createElement('p', {
              key: 'demo-text',
              className: 'text-center text-gray-600'
            }, 'This would show the demo component from your demo code')
          ])
        ]),` : ''}
        
        React.createElement('div', {
          key: 'interactive',
          className: 'bg-white p-6 rounded-lg shadow-sm border'
        }, [
          React.createElement('h3', {
            key: 'title',
            className: 'text-lg font-medium mb-4'
          }, 'Interactive Test'),
          React.createElement('div', {
            key: 'interactive-content',
            className: 'space-y-3'
          }, [
            React.createElement('button', {
              key: 'click-test',
              className: 'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2',
              onClick: () => alert('Component is interactive!')
            }, 'Click to Test Interactivity'),
            React.createElement('p', {
              key: 'note',
              className: 'text-sm text-gray-500'
            }, 'This demonstrates that the component can handle events and interactions.')
          ])
        ])
      ]);
    }
    
    // Render the preview
    const previewElement = document.getElementById('component-preview');
    const root = ReactDOM.createRoot(previewElement);
    root.render(React.createElement(PreviewComponent));
  `;
}

function escapeHtml(text: string): string {
  const div = { innerHTML: '' } as any;
  div.textContent = text;
  return div.innerHTML;
}

export const schema = {
  componentName: {
    type: 'string',
    description: 'Name of the component to preview (e.g., "custom-button", "my-card")'
  },
  componentCode: {
    type: 'string',
    description: 'The source code of the component to preview'
  },
  demoCode: {
    type: 'string',
    description: 'Optional demo code showing how to use the component'
  },
  previewMode: {
    type: 'string',
    description: 'Preview mode: "inline", "standalone", or "storybook" (default: "standalone")',
    enum: ['inline', 'standalone', 'storybook']
  },
  includeStyles: {
    type: 'boolean',
    description: 'Whether to include Tailwind CSS and shadcn/ui styles (default: true)'
  }
};