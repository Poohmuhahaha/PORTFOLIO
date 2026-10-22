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
  posterImage: string;
  credits: ProjectCredit[];
  galleryImages?: string[];
  role?: string;
  artist?: string;
  label?: string;
  studio?: string;
}

export const PROJECTS: ProjectItem[] = [
  {
    id: 'm-lettre-infinie',
    title: 'm - lettre infinie',
    shortTitle: 'M',
    subtitle: 'cd & vinyl',
    category: 'Music & Editorial Design',
    year: '2019',
    color: '#cbdde4',
    textColor: '#ffffff',
    posterImage: '/images/projects/m-lettre-infinie.png',
    description:
      'Influenced by blue hues and the forthcoming birth of his son. The cover\'s repeated "M" forms graphic infinity lines, while handwritten lyrics inside the CD and vinyl add a contrasting personal touch. A challenging yet fulfilling project, creating prideful collaboration with the esteemed artist.',
    role: 'Graphic Designer',
    artist: 'Matthieu Chedid',
    label: 'Labo-M / 3eme bureau',
    studio: 'Machine Molle',
    credits: [
      { type: 'Role', name: 'Graphic Designer' },
      { type: 'Artist', name: 'Matthieu Chedid', url: 'https://www.instagram.com/m_chedid/' },
      { type: 'Label', name: 'Labo-M / 3eme bureau', url: 'https://labo-m.net/' },
      { type: 'Studio', name: 'Machine Molle', url: 'https://www.machinemolle.com/' }
    ],
    galleryImages: [
      '/images/projects/m-lettre-infinie/cover-1.png',
      '/images/projects/m-lettre-infinie/cover-2.png',
      '/images/projects/m-lettre-infinie/cover-3.png',
      '/images/projects/m-lettre-infinie/cover-4.png'
    ]
  },
  {
    id: 'ponpon-mania',
    title: 'ponpon mania',
    shortTitle: 'PONPON',
    subtitle: 'interactive web comic',
    category: 'Digital Web Comic & Narrative',
    year: '2024',
    color: '#fed838',
    textColor: '#ffffff',
    posterImage: '/images/projects/ponpon-mania.jpg',
    description:
      'An interactive web comic following the psychedelic escapades of Ponpon the sheep and his surreal companions. Created in collaboration with creative developers and sound designers.',
    role: 'Art Direction & Illustration',
    artist: 'Justine Soulié',
    studio: 'Patrick Heng & Studio Vandal',
    credits: [
      { type: 'Art Direction & Illustration', name: 'Justine Soulié' },
      { type: 'Creative Development', name: 'Patrick Heng', url: 'https://patrickheng.com' },
      { type: 'Sound Design', name: 'Studio Vandal' }
    ]
  },
  {
    id: 'pop-art-car',
    title: 'pop art car',
    shortTitle: 'POP ART CAR',
    subtitle: 'immersive exhibition',
    category: 'Brand Experience & Event',
    year: '2024',
    color: '#0055ff',
    textColor: '#ffffff',
    posterImage: '/images/projects/pop-art-car.png',
    description:
      'For the launch of the new Twingo, Renault transformed its Champs-Élysées flagship into an immersive festival of music, dance, and live performances. A vibrant pop identity bringing Twingo\'s playful identity to life.',
    role: 'Lead Visual Identity',
    artist: 'Renault France',
    studio: '17Mars',
    credits: [
      { type: 'Visual Direction', name: 'Justine Soulié' },
      { type: 'Agency', name: '17Mars' },
      { type: 'Client', name: 'Renault France' }
    ]
  },
  {
    id: 'miscellaneous',
    title: 'miscellaneous',
    shortTitle: 'MISC',
    subtitle: 'eclectic projects',
    category: 'Experimental & Print',
    year: '2023–2025',
    color: '#fde4f2',
    textColor: '#252422',
    posterImage: '/images/projects/miscellaneous.png',
    description:
      'A joyful collection of personal explorations, stickers, heart characters on skateboards, textile goods, and playful vector shapes made with lots of love.',
    role: 'Creative Direction & Illustration',
    credits: [
      { type: 'Role', name: 'Illustrator & Designer' },
      { type: 'Medium', name: 'Screenprint, Risograph, Apparel' }
    ]
  },
  {
    id: 'hermes-gift-me-a-dream',
    title: 'hermès',
    shortTitle: 'HERMÈS',
    subtitle: 'promotional film & art direction',
    category: 'Luxury & Motion Design',
    year: '2023',
    color: '#fafaf7',
    textColor: '#252422',
    posterImage: '/images/projects/hermes-gift-me-a-dream.png',
    description:
      'Dreamlike animated sequences and papercraft illustrations for Hermès holiday campaigns, featuring whimsical clouds, golden helices, and artisan journeys.',
    role: 'Art Director & Illustrator',
    artist: 'Hermès Paris',
    credits: [
      { type: 'Art Direction', name: 'Justine Soulié' },
      { type: 'Client', name: 'Hermès Paris' }
    ]
  },
  {
    id: 'illustrations',
    title: 'extra',
    shortTitle: 'EXTRA',
    subtitle: 'illustrated creations',
    category: 'Editorial Illustration',
    year: '2023–2024',
    color: '#ffe0f2',
    textColor: '#252422',
    posterImage: '/images/projects/illustrations.png',
    description:
      'Expressive editorial character portraits, risograph prints, and book cover explorations celebrating texture, raw strokes, and vibrant emotions.',
    role: 'Illustrator',
    credits: [{ type: 'Illustration', name: 'Justine Soulié' }]
  },
  {
    id: 'typography',
    title: 'typography',
    shortTitle: 'TYPO',
    subtitle: 'compositions and designs',
    category: 'Custom Type & Lettering',
    year: '2023',
    color: '#c8cbdc',
    textColor: '#252422',
    posterImage: '/images/projects/typography.png',
    description:
      'Custom typographic sculptures, modular display glyphs, kinetic lettering experiments, and poster layouts exploring the tension between legible form and abstract geometry.',
    role: 'Type Designer & Layout',
    credits: [{ type: 'Type Design', name: 'Justine Soulié' }]
  },
  {
    id: 'house-of-frog',
    title: 'house of frog',
    shortTitle: 'FROG',
    subtitle: 'immersive exhibition & festival',
    category: 'Spatial & Experience',
    year: '2024',
    color: '#26d07c',
    textColor: '#ffffff',
    posterImage: '/images/projects/house-of-frog.png',
    description:
      'Immersive festival environment featuring oversized inflatable characters, interactive projection mapping, and playful visual wayfinding.',
    role: 'Creative Director',
    credits: [
      { type: 'Direction', name: 'Justine Soulié' },
      { type: 'Production', name: 'Renault Twingo Festival' }
    ]
  }
];
