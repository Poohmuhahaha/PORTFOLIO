export interface ProjectItem {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  year: string;
  description: string;
  tags: string[];
  role: string;
  paletteTheme: string;
  accentColor: string;
  secondaryColor: string;
  stats: string;
}

export const RENAISSANCE_PALETTES = {
  background: '#927A5F',
  themes: [
    {
      id: 1,
      theme: 'Landscape',
      colors: ['#E5C69F', '#2E2311', '#B8AD9C', '#564222', '#92743E']
    },
    {
      id: 2,
      theme: 'Classical Bust Sculpture',
      colors: ['#EBE8E7', '#736C60', '#CD8DB0', '#A5896F']
    },
    {
      id: 3,
      theme: 'Portrait of Woman with Bowl',
      colors: ['#26211A', '#D2CAB4', '#B19C73', '#6D4F27', '#4F5B6B']
    },
    {
      id: 4,
      theme: 'Baroque Fresco Architecture',
      colors: ['#5A452D', '#312822', '#C6B18F', '#7A3F34']
    },
    {
      id: 5,
      theme: 'Classical Ruins Architecture',
      colors: ['#251D13', '#443220', '#685035', '#8D6C45', '#C3BDB8']
    }
  ]
};

export const PROJECTS: ProjectItem[] = [
  {
    id: 'artibition',
    title: 'Artibition',
    subtitle: 'Global Art Exhibition & Curated Gallery Platform',
    category: 'Creative Platform',
    year: '2025–2026',
    description:
      'Digital archive for discovering art exhibitions, world galleries, and museum chronicles with an editorial CMS and Cloudflare R2 storage.',
    tags: ['Next.js 16', 'WebGPU / 3D', 'Turborepo', 'Bun', 'Prisma'],
    role: 'Lead Architect & Fullstack',
    paletteTheme: 'Baroque Fresco Architecture',
    accentColor: '#C6B18F', // Warm Gilded Beige
    secondaryColor: '#7A3F34', // Terracotta
    stats: 'Global Art Discovery • 20+ Galleries'
  },
  {
    id: 'huuk',
    title: 'Huuk',
    subtitle: 'Creator Content Planner & Publishing Engine',
    category: 'Productivity System',
    year: '2025–Ongoing',
    description:
      'Multi-platform editorial system for Meta, TikTok & YouTube creators with real-time markdown revisions, client portals, and hardened Rust backend.',
    tags: ['Vue 3', 'TypeScript', 'Rust (Axum)', 'Automated Tests', 'Tailwind'],
    role: 'Co-founder & Frontend Lead',
    paletteTheme: 'Classical Bust Sculpture',
    accentColor: '#CD8DB0', // Dusky Mauve
    secondaryColor: '#EBE8E7', // Pale Alabaster
    stats: '200+ Automated Tests • Sub-5ms API'
  },
  {
    id: 'pugu',
    title: 'Pugu',
    subtitle: 'Multi-Tenant Workspace & Relationship Graph',
    category: 'Enterprise Data',
    year: '2025–Ongoing',
    description:
      'Structured collaborative workspace featuring typed collection engines, relational visual node graphs, and seat-based enterprise billing.',
    tags: ['Vue 3', 'Design System', 'Rust API', 'Tauri Desktop', 'Graph View'],
    role: 'Frontend Systems Engineer',
    paletteTheme: 'Portrait of Woman with Bowl',
    accentColor: '#B19C73', // Antique Gold
    secondaryColor: '#4F5B6B', // Slate Steel Blue
    stats: 'Interactive Node Graph • Multi-tenant'
  },
  {
    id: 'ascott-cluster',
    title: 'Ascott Cluster',
    subtitle: 'Hospitality Funnel & CRO Optimization System',
    category: 'Performance & Growth',
    year: '2025',
    description:
      'Digital revenue channel analysis across 10 global nationalities with technical SEO audit, booking flow optimization, and rich interactive engagement.',
    tags: ['Technical SEO', 'CRO Funnel', 'Audience Segmentation', 'LINE OA'],
    role: 'Sales & Marketing Consultant',
    paletteTheme: 'Landscape',
    accentColor: '#E5C69F', // Warm Wheat
    secondaryColor: '#564222', // Olive Bronze
    stats: '10 Global Segments • High Direct Bookings'
  },
  {
    id: 'teenueng-studio',
    title: 'Teenueng Studio',
    subtitle: 'Independent Web & Creative Technology Lab',
    category: 'Creative Laboratory',
    year: '2025–Present',
    description:
      'Digital research studio dedicated to crafting high-performance web applications, artistic 3D experiences, and resilient digital architectures.',
    tags: ['Creative Coding', 'Rust', 'Vue 3', 'Micro-interactions'],
    role: 'Co-founder',
    paletteTheme: 'Classical Ruins Architecture',
    accentColor: '#8D6C45', // Weathered Ochre
    secondaryColor: '#C3BDB8', // Light Ash Stone
    stats: '3 In-house Products • Web Excellence'
  }
];
