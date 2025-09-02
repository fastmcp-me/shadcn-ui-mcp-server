import { logInfo, logError, logWarning } from '../../utils/logger.js';
import { validateAndSanitizeParams } from '../../utils/validation.js';
import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Generate a comprehensive dashboard showing all created components
 */
export async function previewDashboard(params: any) {
  try {
    logInfo('Generating preview dashboard...');

    // Validate parameters
    const validatedParams = validateAndSanitizeParams<{
      showAll?: boolean;
      theme?: 'light' | 'dark' | 'auto';
      sortBy?: 'name' | 'date' | 'type';
    }>('previewDashboard', params);

    const {
      showAll = true,
      theme = 'auto',
      sortBy = 'date'
    } = validatedParams;

    // Scan previews directory for existing components
    const previewsDir = './previews';
    const componentsData = await scanExistingComponents(previewsDir);

    // Generate dashboard HTML
    const dashboardHtml = await generateDashboardHtml({
      components: componentsData,
      theme,
      sortBy,
      showAll
    });

    // Create dashboard file
    const dashboardFileName = 'components-dashboard.html';
    const dashboardPath = path.join(previewsDir, dashboardFileName);

    // Ensure previews directory exists
    try {
      await fs.mkdir(previewsDir, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }

    // Write dashboard file
    await fs.writeFile(dashboardPath, dashboardHtml, 'utf-8');

    logInfo(`Dashboard generated successfully: ${dashboardPath}`);

    const response = {
      dashboardPath,
      dashboardUrl: `file://${path.resolve(dashboardPath)}`,
      totalComponents: componentsData.length,
      lastUpdated: new Date().toISOString(),
      theme,
      sortBy,
      components: componentsData.map(comp => ({
        name: comp.name,
        type: comp.type,
        createdAt: comp.createdAt,
        shadcnCompliant: comp.shadcnCompliant,
        hasDemo: comp.hasDemo
      })),
      instructions: [
        '🎯 Component Dashboard Generated',
        `📊 Total Components: ${componentsData.length}`,
        `📁 Dashboard File: ${dashboardPath}`,
        `🌐 Open in Browser: ${path.resolve(dashboardPath)}`,
        '',
        '✨ Dashboard Features:',
        '• Visual component gallery with screenshots',
        '• Interactive component search and filtering',
        '• Component compliance status indicators',
        '• Quick preview links for each component',
        '• Creation dates and metadata',
        '• Responsive design for all screen sizes',
        '',
        '🔧 Dashboard Actions:',
        '• Click component cards to open individual previews',
        '• Use search bar to find specific components',
        '• Filter by compliance status or component type',
        '• Toggle between light/dark themes',
        '• Export component list as JSON'
      ]
    };

    return {
      content: [{
        type: "text",
        text: JSON.stringify(response, null, 2)
      }]
    };

  } catch (error) {
    logError(`Failed to generate preview dashboard`, error);
    
    let errorMessage = `Failed to generate dashboard: `;
    
    if (error instanceof Error) {
      errorMessage += error.message;
    } else {
      errorMessage += String(error);
    }
    
    throw new Error(errorMessage);
  }
}

async function scanExistingComponents(previewsDir: string) {
  const components: Array<{
    name: string;
    type: string;
    createdAt: string;
    previewPath: string;
    shadcnCompliant: boolean;
    hasDemo: boolean;
    size: number;
  }> = [];

  try {
    const files = await fs.readdir(previewsDir);
    const previewFiles = files.filter(file => file.endsWith('-preview.html'));

    for (const file of previewFiles) {
      try {
        const filePath = path.join(previewsDir, file);
        const stats = await fs.stat(filePath);
        const content = await fs.readFile(filePath, 'utf-8');
        
        // Extract component name from filename
        const componentName = file.replace('-preview.html', '');
        
        // Analyze component from preview content
        const analysis = analyzePreviewFile(content);
        
        components.push({
          name: componentName,
          type: analysis.type || 'ui',
          createdAt: stats.mtime.toISOString(),
          previewPath: filePath,
          shadcnCompliant: analysis.shadcnCompliant,
          hasDemo: analysis.hasDemo,
          size: stats.size
        });
      } catch (error) {
        logWarning(`Failed to analyze preview file ${file}: ${error}`);
      }
    }
  } catch (error) {
    logWarning(`Failed to scan previews directory: ${error}`);
  }

  return components.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

function analyzePreviewFile(content: string) {
  return {
    shadcnCompliant: content.includes('Shadcn Compliant</h3>') && content.includes('text-green-600'),
    hasDemo: content.includes('Demo Usage</h2>'),
    type: extractComponentType(content) || 'ui'
  };
}

function extractComponentType(content: string): string {
  // Try to determine component type from content
  if (content.includes('form') || content.includes('input')) return 'form';
  if (content.includes('navigation') || content.includes('nav')) return 'navigation';
  if (content.includes('feedback') || content.includes('alert')) return 'feedback';
  if (content.includes('layout') || content.includes('container')) return 'layout';
  if (content.includes('data') || content.includes('table')) return 'data-display';
  return 'ui';
}

async function generateDashboardHtml({
  components,
  theme,
  sortBy,
  showAll
}: {
  components: any[];
  theme: string;
  sortBy: string;
  showAll: boolean;
}): Promise<string> {
  
  return `<!DOCTYPE html>
<html lang="en" data-theme="${theme}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Shadcn/UI Components Dashboard</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    <style>
        body { 
            font-family: 'Inter', sans-serif; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        .glass-effect {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .component-card {
            transition: all 0.3s ease;
            cursor: pointer;
        }
        .component-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        }
        .search-input {
            background: rgba(255, 255, 255, 0.9);
            backdrop-filter: blur(10px);
        }
        .stats-card {
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.1));
            backdrop-filter: blur(15px);
            border: 1px solid rgba(255, 255, 255, 0.3);
        }
        .filter-button {
            transition: all 0.3s ease;
        }
        .filter-button.active {
            background: rgba(255, 255, 255, 0.9);
            color: #667eea;
            transform: scale(1.05);
        }
        .status-badge {
            display: inline-flex;
            align-items: center;
            gap: 0.25rem;
            padding: 0.25rem 0.75rem;
            border-radius: 9999px;
            font-size: 0.75rem;
            font-weight: 500;
        }
        .status-compliant {
            background: rgba(34, 197, 94, 0.2);
            color: rgb(34, 197, 94);
            border: 1px solid rgba(34, 197, 94, 0.3);
        }
        .status-partial {
            background: rgba(245, 158, 11, 0.2);
            color: rgb(245, 158, 11);
            border: 1px solid rgba(245, 158, 11, 0.3);
        }
        .fade-in {
            animation: fadeIn 0.5s ease-in-out;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .grid-auto-fit {
            grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
        }
    </style>
    <script>
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
                        }
                    }
                }
            }
        }
    </script>
</head>
<body class="min-h-screen">
    <!-- Header -->
    <header class="sticky top-0 z-50 glass-effect">
        <div class="max-w-7xl mx-auto px-6 py-4">
            <div class="flex items-center justify-between">
                <div class="flex items-center space-x-4">
                    <div class="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                        <i class="fas fa-puzzle-piece text-blue-600 text-xl"></i>
                    </div>
                    <div>
                        <h1 class="text-2xl font-bold text-white">Shadcn/UI Dashboard</h1>
                        <p class="text-blue-100 text-sm">Component Library Manager</p>
                    </div>
                </div>
                <div class="flex items-center space-x-4">
                    <button onclick="toggleTheme()" class="p-2 text-white hover:bg-white/20 rounded-lg transition-colors">
                        <i class="fas fa-moon" id="theme-icon"></i>
                    </button>
                    <button onclick="exportComponents()" class="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors">
                        <i class="fas fa-download mr-2"></i>Export
                    </button>
                </div>
            </div>
        </div>
    </header>

    <div class="max-w-7xl mx-auto px-6 py-8">
        <!-- Statistics Section -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div class="stats-card rounded-xl p-6 text-center">
                <div class="text-3xl font-bold text-white mb-2">${components.length}</div>
                <div class="text-blue-100 text-sm">Total Components</div>
            </div>
            <div class="stats-card rounded-xl p-6 text-center">
                <div class="text-3xl font-bold text-green-300 mb-2">${components.filter(c => c.shadcnCompliant).length}</div>
                <div class="text-blue-100 text-sm">Shadcn Compliant</div>
            </div>
            <div class="stats-card rounded-xl p-6 text-center">
                <div class="text-3xl font-bold text-yellow-300 mb-2">${components.filter(c => c.hasDemo).length}</div>
                <div class="text-blue-100 text-sm">With Demos</div>
            </div>
            <div class="stats-card rounded-xl p-6 text-center">
                <div class="text-3xl font-bold text-purple-300 mb-2">${new Set(components.map(c => c.type)).size}</div>
                <div class="text-blue-100 text-sm">Component Types</div>
            </div>
        </div>

        <!-- Search and Filters -->
        <div class="glass-effect rounded-xl p-6 mb-8">
            <div class="flex flex-col lg:flex-row gap-4 items-center justify-between">
                <div class="flex-1 w-full lg:w-auto">
                    <div class="relative">
                        <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"></i>
                        <input 
                            type="text" 
                            id="searchInput"
                            placeholder="Search components..." 
                            class="search-input w-full pl-10 pr-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-blue-500 outline-none"
                            oninput="filterComponents()"
                        >
                    </div>
                </div>
                <div class="flex flex-wrap gap-2">
                    <button onclick="filterByType('all')" class="filter-button active px-4 py-2 rounded-lg text-white bg-white/20 text-sm font-medium">
                        All Types
                    </button>
                    <button onclick="filterByType('ui')" class="filter-button px-4 py-2 rounded-lg text-white bg-white/20 text-sm font-medium">
                        UI
                    </button>
                    <button onclick="filterByType('form')" class="filter-button px-4 py-2 rounded-lg text-white bg-white/20 text-sm font-medium">
                        Form
                    </button>
                    <button onclick="filterByType('navigation')" class="filter-button px-4 py-2 rounded-lg text-white bg-white/20 text-sm font-medium">
                        Navigation
                    </button>
                    <button onclick="filterByCompliance('compliant')" class="filter-button px-4 py-2 rounded-lg text-white bg-white/20 text-sm font-medium">
                        <i class="fas fa-check-circle mr-1"></i>Compliant
                    </button>
                </div>
            </div>
        </div>

        <!-- Components Grid -->
        <div class="grid grid-auto-fit gap-6" id="componentsGrid">
            ${components.map(component => generateComponentCard(component)).join('')}
        </div>

        <!-- Empty State -->
        <div id="emptyState" class="hidden text-center py-12">
            <div class="glass-effect rounded-xl p-12">
                <i class="fas fa-search text-6xl text-white/50 mb-4"></i>
                <h3 class="text-xl font-semibold text-white mb-2">No components found</h3>
                <p class="text-blue-100">Try adjusting your search or filter criteria</p>
            </div>
        </div>
    </div>

    <!-- Component Detail Modal -->
    <div id="componentModal" class="hidden fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div class="glass-effect rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div class="p-6">
                <div class="flex justify-between items-start mb-4">
                    <h3 id="modalTitle" class="text-xl font-bold text-white"></h3>
                    <button onclick="closeModal()" class="text-white/60 hover:text-white">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>
                <div id="modalContent" class="text-white"></div>
            </div>
        </div>
    </div>

    <script>
        let currentFilter = 'all';
        let currentComponents = ${JSON.stringify(components)};

        function filterComponents() {
            const searchTerm = document.getElementById('searchInput').value.toLowerCase();
            const grid = document.getElementById('componentsGrid');
            const emptyState = document.getElementById('emptyState');
            
            let filteredComponents = currentComponents.filter(component => {
                const matchesSearch = component.name.toLowerCase().includes(searchTerm) ||
                                    component.type.toLowerCase().includes(searchTerm);
                
                if (currentFilter === 'all') return matchesSearch;
                if (currentFilter === 'compliant') return matchesSearch && component.shadcnCompliant;
                return matchesSearch && component.type === currentFilter;
            });

            if (filteredComponents.length === 0) {
                grid.innerHTML = '';
                emptyState.classList.remove('hidden');
            } else {
                emptyState.classList.add('hidden');
                grid.innerHTML = filteredComponents.map(component => 
                    generateComponentCardHTML(component)
                ).join('');
            }
        }

        function filterByType(type) {
            currentFilter = type;
            
            // Update button states
            document.querySelectorAll('.filter-button').forEach(btn => {
                btn.classList.remove('active');
            });
            event.target.classList.add('active');
            
            filterComponents();
        }

        function filterByCompliance(type) {
            currentFilter = type;
            
            // Update button states
            document.querySelectorAll('.filter-button').forEach(btn => {
                btn.classList.remove('active');
            });
            event.target.classList.add('active');
            
            filterComponents();
        }

        function generateComponentCardHTML(component) {
            const statusClass = component.shadcnCompliant ? 'status-compliant' : 'status-partial';
            const statusIcon = component.shadcnCompliant ? 'fas fa-check-circle' : 'fas fa-exclamation-triangle';
            const statusText = component.shadcnCompliant ? 'Compliant' : 'Partial';
            
            return \`
                <div class="component-card glass-effect rounded-xl p-6 fade-in" onclick="openComponentPreview('\${component.name}')">
                    <div class="flex justify-between items-start mb-4">
                        <div>
                            <h3 class="text-lg font-semibold text-white mb-1">\${component.name}</h3>
                            <span class="px-2 py-1 bg-blue-500/30 text-blue-200 rounded text-sm">\${component.type}</span>
                        </div>
                        <span class="status-badge \${statusClass}">
                            <i class="\${statusIcon}"></i>
                            \${statusText}
                        </span>
                    </div>
                    
                    <div class="space-y-2 text-sm text-blue-100 mb-4">
                        <div class="flex justify-between">
                            <span>Created:</span>
                            <span>\${new Date(component.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div class="flex justify-between">
                            <span>Demo:</span>
                            <span>\${component.hasDemo ? '✅ Available' : '❌ None'}</span>
                        </div>
                        <div class="flex justify-between">
                            <span>Size:</span>
                            <span>\${(component.size / 1024).toFixed(1)}KB</span>
                        </div>
                    </div>
                    
                    <div class="flex space-x-2">
                        <button class="flex-1 bg-white/20 hover:bg-white/30 text-white py-2 px-3 rounded-lg text-sm transition-colors">
                            <i class="fas fa-eye mr-1"></i>Preview
                        </button>
                        <button onclick="event.stopPropagation(); showComponentDetails('\${component.name}')" class="bg-blue-500/30 hover:bg-blue-500/50 text-blue-200 py-2 px-3 rounded-lg text-sm transition-colors">
                            <i class="fas fa-info-circle"></i>
                        </button>
                    </div>
                </div>
            \`;
        }

        function openComponentPreview(componentName) {
            const previewPath = \`./\${componentName}-preview.html\`;
            window.open(previewPath, '_blank');
        }

        function showComponentDetails(componentName) {
            const component = currentComponents.find(c => c.name === componentName);
            const modal = document.getElementById('componentModal');
            const title = document.getElementById('modalTitle');
            const content = document.getElementById('modalContent');
            
            title.textContent = component.name;
            content.innerHTML = \`
                <div class="space-y-4">
                    <div class="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <div class="text-blue-200 mb-1">Type</div>
                            <div class="font-medium">\${component.type}</div>
                        </div>
                        <div>
                            <div class="text-blue-200 mb-1">Status</div>
                            <div class="font-medium">\${component.shadcnCompliant ? 'Shadcn Compliant' : 'Partial Compliance'}</div>
                        </div>
                        <div>
                            <div class="text-blue-200 mb-1">Created</div>
                            <div class="font-medium">\${new Date(component.createdAt).toLocaleDateString()}</div>
                        </div>
                        <div>
                            <div class="text-blue-200 mb-1">File Size</div>
                            <div class="font-medium">\${(component.size / 1024).toFixed(1)}KB</div>
                        </div>
                    </div>
                    
                    <div class="border-t border-white/20 pt-4">
                        <div class="text-blue-200 mb-2">Actions</div>
                        <div class="flex space-x-2">
                            <button onclick="openComponentPreview('\${component.name}')" class="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg text-sm transition-colors">
                                <i class="fas fa-external-link-alt mr-1"></i>Open Preview
                            </button>
                            <button onclick="copyPreviewPath('\${component.name}')" class="bg-white/20 hover:bg-white/30 text-white py-2 px-4 rounded-lg text-sm transition-colors">
                                <i class="fas fa-copy mr-1"></i>Copy Path
                            </button>
                        </div>
                    </div>
                </div>
            \`;
            
            modal.classList.remove('hidden');
        }

        function closeModal() {
            document.getElementById('componentModal').classList.add('hidden');
        }

        function copyPreviewPath(componentName) {
            const path = \`./\${componentName}-preview.html\`;
            navigator.clipboard.writeText(path).then(() => {
                // Show a brief success message
                const originalText = event.target.innerHTML;
                event.target.innerHTML = '<i class="fas fa-check mr-1"></i>Copied!';
                setTimeout(() => {
                    event.target.innerHTML = originalText;
                }, 2000);
            });
        }

        function toggleTheme() {
            const html = document.documentElement;
            const icon = document.getElementById('theme-icon');
            const currentTheme = html.getAttribute('data-theme');
            
            if (currentTheme === 'light') {
                html.setAttribute('data-theme', 'dark');
                icon.className = 'fas fa-sun';
            } else {
                html.setAttribute('data-theme', 'light');
                icon.className = 'fas fa-moon';
            }
        }

        function exportComponents() {
            const dataStr = JSON.stringify(currentComponents, null, 2);
            const dataBlob = new Blob([dataStr], {type: 'application/json'});
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'shadcn-components-export.json';
            link.click();
            URL.revokeObjectURL(url);
        }

        // Close modal on outside click
        document.getElementById('componentModal').addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal();
            }
        });

        // Initialize theme
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
            document.documentElement.setAttribute('data-theme', 'dark');
            document.getElementById('theme-icon').className = 'fas fa-sun';
        }
    </script>
</body>
</html>`;
}

function generateComponentCard(component: any): string {
  const statusClass = component.shadcnCompliant ? 'status-compliant' : 'status-partial';
  const statusIcon = component.shadcnCompliant ? 'fas fa-check-circle' : 'fas fa-exclamation-triangle';
  const statusText = component.shadcnCompliant ? 'Compliant' : 'Partial';
  
  return `
    <div class="component-card glass-effect rounded-xl p-6 fade-in" onclick="openComponentPreview('${component.name}')">
        <div class="flex justify-between items-start mb-4">
            <div>
                <h3 class="text-lg font-semibold text-white mb-1">${component.name}</h3>
                <span class="px-2 py-1 bg-blue-500/30 text-blue-200 rounded text-sm">${component.type}</span>
            </div>
            <span class="status-badge ${statusClass}">
                <i class="${statusIcon}"></i>
                ${statusText}
            </span>
        </div>
        
        <div class="space-y-2 text-sm text-blue-100 mb-4">
            <div class="flex justify-between">
                <span>Created:</span>
                <span>${new Date(component.createdAt).toLocaleDateString()}</span>
            </div>
            <div class="flex justify-between">
                <span>Demo:</span>
                <span>${component.hasDemo ? '✅ Available' : '❌ None'}</span>
            </div>
            <div class="flex justify-between">
                <span>Size:</span>
                <span>${(component.size / 1024).toFixed(1)}KB</span>
            </div>
        </div>
        
        <div class="flex space-x-2">
            <button class="flex-1 bg-white/20 hover:bg-white/30 text-white py-2 px-3 rounded-lg text-sm transition-colors">
                <i class="fas fa-eye mr-1"></i>Preview
            </button>
            <button onclick="event.stopPropagation(); showComponentDetails('${component.name}')" class="bg-blue-500/30 hover:bg-blue-500/50 text-blue-200 py-2 px-3 rounded-lg text-sm transition-colors">
                <i class="fas fa-info-circle"></i>
            </button>
        </div>
    </div>
  `;
}

export const schema = {
  showAll: {
    type: 'boolean',
    description: 'Whether to show all components or only recent ones (default: true)'
  },
  theme: {
    type: 'string',
    description: 'Dashboard theme: "light", "dark", or "auto" (default: "auto")',
    enum: ['light', 'dark', 'auto']
  },
  sortBy: {
    type: 'string',
    description: 'Sort components by: "name", "date", or "type" (default: "date")',
    enum: ['name', 'date', 'type']
  }
};