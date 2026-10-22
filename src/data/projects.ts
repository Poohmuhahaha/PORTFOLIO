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
  liveUrl?: string;
  githubUrl?: string;
  paletteColors?: string[];
  highlights?: string[];
}

export const PROJECTS: ProjectItem[] = [
  {
    id: 'hydro-core',
    title: 'Hydro Core',
    subtitle: 'Eulerian Navier-Stokes GPU Fluid Dynamics & Creative Physics Lab',
    category: 'Fluid Dynamics & GPU Physics',
    year: '2025–2026',
    description:
      'คลังโค้ดจำลองพลศาสตร์ของเหลว (Fluid Dynamics) บน GPU แก้สมการ Incompressible Navier-Stokes แบบเรียลไทม์ 60 FPS ครบทั้ง Advection, Jacobi Poisson Pressure, Vorticity Confinement, Multi-color Dye Diffusion และ Curl Noise Turbulence ตอบสนองต่อเมาส์และแรงสะบัดอย่างเป็นธรรมชาติ',
    tags: ['WebGL / WebGPU', 'Navier-Stokes', 'GLSL Shaders', 'GPGPU', 'Fluid Physics'],
    role: 'Lead Physics & Creative Developer',
    paletteTheme: 'Navier-Stokes Liquid Dynamics',
    accentColor: '#38bdf8', // Luminous Cyan
    secondaryColor: '#f43f5e', // Coral Rose
    stats: 'Eulerian Grid • 60 FPS Real-time Fluid',
    liveUrl: 'https://github.com/Poohmuhahaha',
    githubUrl: 'https://github.com/Poohmuhahaha',
    paletteColors: ['#0f172a', '#38bdf8', '#818cf8', '#f43f5e', '#facc15'],
    highlights: [
      'แก้สมการ Navier-Stokes บน GPU เรียลไทม์: Advection, Pressure Projection, Vorticity Confinement',
      'Multi-pass Ping-Pong FBO Architecture คำนวณความเร็ว (Velocity) และความหนาแน่นสี (Dye) 60fps',
      'ระบบผสมสีของเหลวตามสัมผัสเมาส์ พร้อมประกายแสงสะท้อนผิวน้ำ (Specular Crest Sheen)',
      'คลังโค้ดจำลองของเหลวแบบ Open Source พร้อมพารามิเตอร์ Viscosity, Vorticity และ Dissipation ปรับแต่งได้อิสระ'
    ]
  },
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
    accentColor: '#c6b18f', // Warm Gilded Beige
    secondaryColor: '#7a3f34', // Terracotta
    stats: 'Global Art Discovery • 20+ Galleries',
    liveUrl: 'https://artibition.art',
    githubUrl: 'https://github.com/Poohmuhahaha',
    paletteColors: ['#5a452d', '#312822', '#c6b18f', '#7a3f34'],
    highlights: [
      'Curated digital chronicle for global museum exhibitions',
      'Editorial CMS powered by Next.js 16 & Cloudflare R2',
      'Dynamic 3D exhibition halls powered by WebGPU'
    ]
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
    accentColor: '#cd8db0', // Dusky Mauve
    secondaryColor: '#ebe8e7', // Pale Alabaster
    stats: '200+ Automated Tests • Sub-5ms API',
    liveUrl: 'https://github.com/Poohmuhahaha/huuk-tech',
    githubUrl: 'https://github.com/Poohmuhahaha/huuk-tech',
    paletteColors: ['#ebe8e7', '#736c60', '#cd8db0', '#a5896f'],
    highlights: [
      'Cross-platform creator publishing engine (Meta, TikTok, YouTube)',
      'Ultra-resilient Rust Axum backend with sub-5ms API latency',
      '200+ automated integration and unit test coverage'
    ]
  },
  {
    id: 'pugu',
    title: 'Pugu',
    subtitle: 'Multi-Tenant Workspace & Relational Graph View',
    category: 'Enterprise Data',
    year: '2025–Ongoing',
    description:
      'Structured collaborative workspace featuring typed collection engines, relational visual node graphs, and seat-based enterprise billing.',
    tags: ['Vue 3', 'Design System', 'Rust API', 'Tauri Desktop', 'Graph View'],
    role: 'Frontend Systems Engineer',
    paletteTheme: 'Portrait of Woman with Bowl',
    accentColor: '#b19c73', // Antique Gold
    secondaryColor: '#4f5b6b', // Slate Steel Blue
    stats: 'Interactive Node Graph • Multi-tenant',
    liveUrl: 'https://github.com/Poohmuhahaha/pugu-tech',
    githubUrl: 'https://github.com/Poohmuhahaha/pugu-tech',
    paletteColors: ['#26211a', '#d2cab4', '#b19c73', '#6d4f27', '#4f5b6b'],
    highlights: [
      'Multi-tenant collaborative enterprise workspace',
      'Interactive relational node graph with real-time updates',
      'Cross-platform desktop distribution powered by Tauri'
    ]
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
    accentColor: '#8d6c45', // Weathered Ochre
    secondaryColor: '#c3bdb8', // Light Ash Stone
    stats: '3 In-house Products • Web Excellence',
    liveUrl: 'https://github.com/Poohmuhahaha',
    githubUrl: 'https://github.com/Poohmuhahaha',
    paletteColors: ['#251d13', '#443220', '#685035', '#8d6c45', '#c3bdb8'],
    highlights: [
      'Independent creative technology & digital archive lab',
      'Pioneering tactile 3D WebGPU and procedural architectural shaders',
      'Zero-dependency reactive micro-interactions'
    ]
  }
];
