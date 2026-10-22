export interface ProjectCredit {
  type: string;
  name: string;
  url?: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  shortTitle?: string;
  subtitle: string;
  category: string;
  year: string;
  description: string;
  color: string;
  textColor?: string;
  accentColor: string;
  secondaryColor?: string;
  credits: ProjectCredit[];
  galleryImages?: string[];
  highlights?: string[];
  stats?: string;
  role?: string;
  artist?: string;
  label?: string;
  studio?: string;
  liveUrl?: string;
  githubUrl?: string;
  posterImage?: string;
}

export const PROJECTS: ProjectItem[] = [
  {
    id: 'hydro-core',
    title: 'hydro core',
    shortTitle: 'HYDRO CORE',
    subtitle: 'eulerian navier-stokes fluid dynamics lab',
    category: 'Fluid Dynamics & GPU Physics',
    year: '2025–2026',
    color: '#0b1626',
    textColor: '#e0f2fe',
    accentColor: '#38bdf8',
    secondaryColor: '#818cf8',
    stats: 'Eulerian Grid • 60 FPS Real-time Fluid Dynamics',
    posterImage: '/textures/projects/hydro-core-cover.jpg',
    description:
      'คลังโค้ดจำลองพลศาสตร์ของเหลว (Fluid Dynamics) บน GPU แก้สมการ Incompressible Navier-Stokes แบบเรียลไทม์ 60 FPS ครบทั้ง Advection, Jacobi Poisson Pressure Projection, Vorticity Confinement, Multi-color Dye Diffusion และ Curl Noise Turbulence ตอบสนองต่อเมาส์และแรงสะบัดของมืออย่างเป็นธรรมชาติ',
    role: 'Lead Physics & Creative Developer',
    studio: 'Fluid Dynamics & Physics Lab',
    liveUrl: 'https://github.com/Poohmuhahaha',
    githubUrl: 'https://github.com/Poohmuhahaha',
    credits: [
      { type: 'Role', name: 'Lead Creative Physics Developer' },
      { type: 'Author', name: 'Phuwadon Thontra', url: 'https://github.com/Poohmuhahaha' },
      { type: 'Physics Engine', name: 'Eulerian Navier-Stokes GPU FBO' },
      { type: 'Shaders', name: 'Custom GLSL Advection, Divergence & Jacobi Poisson' },
      { type: 'Code Archive', name: 'คลังโค้ดจำลองของเหลว (Open Source)', url: 'https://github.com/Poohmuhahaha' },
      { type: 'Performance', name: 'Real-time 60–120 FPS Double-FBO Architecture' }
    ],
    highlights: [
      'แก้สมการ Incompressible Navier-Stokes บน GPU เรียลไทม์: Advection, Pressure Projection, Vorticity Confinement',
      'Multi-pass Double-FBO Ping-Pong Architecture คำนวณความเร็ว (Velocity) และการแพร่กระจายสีย้อม (Dye Diffusion) 60 FPS',
      'ระบบผสมสีของเหลวตามสัมผัสเมาส์ พร้อมประกายแสงสะท้อนผิวน้ำ (Specular Crest Sheen)',
      'คลังโค้ดจำลองของเหลวแบบ Open Source ปรับแต่ง Viscosity, Vorticity และ Dissipation ได้อย่างอิสระ'
    ]
  },
  {
    id: 'artibition',
    title: 'artibition',
    shortTitle: 'ARTIBITION',
    subtitle: 'global art exhibition & curated gallery platform',
    category: 'Creative Platform & WebGPU',
    year: '2025–2026',
    color: '#2b221a',
    textColor: '#fdfbf7',
    accentColor: '#c6b18f',
    secondaryColor: '#7a3f34',
    stats: 'Global Art Discovery • 20+ Curated Galleries',
    posterImage: '/textures/projects/artibition-cover.jpg',
    description:
      'Digital archive and curated chronicle for discovering global art exhibitions, masterwork museum collections, and architectural biennials with Next.js 16, Turborepo, Bun, Prisma, and Cloudflare R2 storage.',
    role: 'Lead Architect & Fullstack',
    studio: 'Artibition Global Platform',
    liveUrl: 'https://artibition.art',
    githubUrl: 'https://github.com/Poohmuhahaha',
    credits: [
      { type: 'Role', name: 'Lead Architect & Fullstack Developer' },
      { type: 'Author', name: 'Phuwadon Thontra', url: 'https://github.com/Poohmuhahaha' },
      { type: 'Frontend Architecture', name: 'Next.js 16, Turborepo, Bun, WebGPU' },
      { type: 'Storage & CDN', name: 'Cloudflare R2 Object Storage' },
      { type: 'Live Platform', name: 'artibition.art', url: 'https://artibition.art' }
    ],
    highlights: [
      'Curated digital chronicle indexing global museum exhibitions and fine art retrospectives',
      'High-performance editorial CMS powered by Next.js 16, Prisma, and Cloudflare R2',
      'Dynamic 3D museum exhibition halls rendered with physically accurate lighting'
    ]
  },
  {
    id: 'huuk',
    title: 'huuk',
    shortTitle: 'HUUK',
    subtitle: 'creator content planner & editorial publishing engine',
    category: 'Productivity & Editorial Systems',
    year: '2025–Ongoing',
    color: '#392634',
    textColor: '#fae8f2',
    accentColor: '#cd8db0',
    secondaryColor: '#ebe8e7',
    stats: '200+ Automated Tests • Sub-5ms Latency',
    posterImage: '/textures/projects/huuk-cover.jpg',
    description:
      'Multi-platform editorial calendar and content publishing system for creators across Meta, TikTok, and YouTube with real-time collaborative markdown revisions, client portals, and an ultra-low latency Rust backend.',
    role: 'Co-founder & Frontend Lead',
    studio: 'Huuk Tech',
    liveUrl: 'https://github.com/Poohmuhahaha/huuk-tech',
    githubUrl: 'https://github.com/Poohmuhahaha/huuk-tech',
    credits: [
      { type: 'Role', name: 'Co-founder & Frontend Lead' },
      { type: 'Author', name: 'Phuwadon Thontra', url: 'https://github.com/Poohmuhahaha' },
      { type: 'Client Framework', name: 'Vue 3, TypeScript, Tailwind' },
      { type: 'Backend Engine', name: 'Rust (Axum) Sub-5ms API' },
      { type: 'Repository', name: 'GitHub: huuk-tech', url: 'https://github.com/Poohmuhahaha/huuk-tech' }
    ],
    highlights: [
      'Cross-platform creator publishing engine supporting Meta, TikTok, and YouTube workflows',
      'Sub-5ms response time powered by an asynchronous Rust Axum microservice backend',
      'Over 200 automated unit and integration tests verifying schema and state consistency'
    ]
  },
  {
    id: 'pugu',
    title: 'pugu',
    shortTitle: 'PUGU',
    subtitle: 'multi-tenant workspace & relational graph view',
    category: 'Enterprise Data & Interactive Graph',
    year: '2025–Ongoing',
    color: '#1f242b',
    textColor: '#f1f5f9',
    accentColor: '#b19c73',
    secondaryColor: '#4f5b6b',
    stats: 'Interactive Node Graph • Multi-tenant',
    posterImage: '/textures/projects/pugu-cover.jpg',
    description:
      'Structured collaborative enterprise workspace featuring typed collection databases, interactive relational node graphs, and seat-based enterprise billing.',
    role: 'Frontend Systems Engineer',
    studio: 'Pugu Tech',
    liveUrl: 'https://github.com/Poohmuhahaha/pugu-tech',
    githubUrl: 'https://github.com/Poohmuhahaha/pugu-tech',
    credits: [
      { type: 'Role', name: 'Frontend Systems Engineer' },
      { type: 'Author', name: 'Phuwadon Thontra', url: 'https://github.com/Poohmuhahaha' },
      { type: 'UI Systems', name: 'Vue 3 Design System' },
      { type: 'Desktop Core', name: 'Tauri & Rust Architecture' },
      { type: 'Graph Visualizer', name: 'Interactive Relational Canvas Graph' }
    ],
    highlights: [
      'Multi-tenant architecture managing fine-grained role permissions and seat quotas',
      'Interactive relational node graph linking documents, tasks, and data collections',
      'Lightweight cross-platform desktop distribution built with Tauri and WebGPU acceleration'
    ]
  },
  {
    id: 'teenueng-studio',
    title: 'teenueng studio',
    shortTitle: 'TEENUENG STUDIO',
    subtitle: 'independent web & creative technology lab',
    category: 'Creative Studio & R&D',
    year: '2025–Present',
    color: '#261d15',
    textColor: '#f5ebe0',
    accentColor: '#8d6c45',
    secondaryColor: '#c3bdb8',
    stats: '3 In-house Products • Creative Engineering',
    posterImage: '/textures/projects/teenueng-studio-cover.jpg',
    description:
      'Independent creative engineering laboratory dedicated to crafting high-performance web applications, tactile 3D WebGPU experiences, procedural shaders, and resilient digital architectures.',
    role: 'Co-founder',
    studio: 'Teenueng Studio',
    liveUrl: 'https://github.com/Poohmuhahaha',
    githubUrl: 'https://github.com/Poohmuhahaha',
    credits: [
      { type: 'Role', name: 'Co-founder & Creative Technologist' },
      { type: 'Author', name: 'Phuwadon Thontra', url: 'https://github.com/Poohmuhahaha' },
      { type: 'Research Focus', name: 'Physically Based Shaders & WebGPU Graphics' },
      { type: 'Engineering', name: 'Rust, Vue 3, GLSL, WebGL' },
      { type: 'Repository', name: 'GitHub: Poohmuhahaha', url: 'https://github.com/Poohmuhahaha' }
    ],
    highlights: [
      'Pioneering procedural PBR lighting and tactile 3D interactive web experiences',
      'Micro-interaction physics engines engineered with zero external bloat',
      'Three flagship internal products built and deployed under active production'
    ]
  }
];
