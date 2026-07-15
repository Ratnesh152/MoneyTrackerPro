import fs from 'fs';
import path from 'path';

const routes = [
  'transactions',
  'accounts',
  'credit-cards',
  'loans',
  'budgets',
  'goals',
  'investments',
  'reports',
  'settings',
  'profile'
];

const dashboardDir = path.join(process.cwd(), 'app', '(dashboard)');

// Remove [module]
const moduleDir = path.join(dashboardDir, '[module]');
if (fs.existsSync(moduleDir)) {
  fs.rmSync(moduleDir, { recursive: true, force: true });
}

for (const route of routes) {
  const title = route.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  const routeDir = path.join(dashboardDir, route);
  
  if (!fs.existsSync(routeDir)) {
    fs.mkdirSync(routeDir, { recursive: true });
  }

  const content = `import React from 'react';
import ComingSoon from '@/components/shared/ComingSoon';

export default function ${title.replace(/\s+/g, '')}Page() {
  return (
    <div className="flex flex-col w-full">
      <div className="pb-4">
        <h1 className="text-2xl font-bold tracking-tight">${title}</h1>
        <p className="text-muted-foreground">Manage your ${title.toLowerCase()} settings and data.</p>
      </div>
      <div className="bg-card rounded-xl border shadow-sm p-8">
        <ComingSoon title="${title} Module" />
      </div>
    </div>
  );
}
`;

  fs.writeFileSync(path.join(routeDir, 'page.tsx'), content);
}

console.log('Routes generated successfully.');
