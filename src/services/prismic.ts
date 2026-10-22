import * as prismic from '@prismicio/client';
import { PROJECTS as FALLBACK_PROJECTS, type ProjectItem, type ProjectCredit } from '../data/projects';

// Repository name from Vite environment or default fallback
export const PRISMIC_REPO_NAME = import.meta.env.VITE_PRISMIC_REPO_NAME || '';

let client: prismic.Client | null = null;

if (PRISMIC_REPO_NAME) {
  client = prismic.createClient(PRISMIC_REPO_NAME, {
    routes: [
      {
        type: 'project',
        path: '/project/:uid'
      }
    ]
  });
}

/**
 * Transforms a Prismic document into our internal ProjectItem interface
 */
function mapPrismicProject(doc: any): ProjectItem {
  const data = doc.data;

  const credits: ProjectCredit[] = (data.credits || []).map((c: any) => ({
    type: c.credit_type || 'Credit',
    name: c.credit_name || '',
    url: c.credit_url?.url || undefined
  }));

  const highlights: string[] = (data.highlights || [])
    .map((h: any) => h.highlight_text)
    .filter(Boolean);

  // Extract description text from StructuredText
  let descriptionText = '';
  if (Array.isArray(data.description)) {
    descriptionText = data.description.map((block: any) => block.text || '').join('\n');
  } else if (typeof data.description === 'string') {
    descriptionText = data.description;
  }

  return {
    id: doc.uid || doc.id,
    title: data.title || doc.uid,
    shortTitle: data.short_title || data.title?.toUpperCase(),
    subtitle: data.subtitle || '',
    category: data.category || 'Creative Technology',
    year: data.year || '2026',
    color: data.color || '#0b1626',
    textColor: '#ffffff',
    accentColor: data.accent_color || '#c6b18f',
    stats: data.stats || undefined,
    description: descriptionText || '',
    role: data.role || undefined,
    studio: data.studio || undefined,
    githubUrl: data.github_url?.url || undefined,
    liveUrl: data.live_url?.url || undefined,
    posterImage: data.poster_image?.url || `/textures/projects/${doc.uid}-cover.jpg`,
    credits: credits.length > 0 ? credits : [
      { type: 'Role', name: data.role || 'Lead Developer' }
    ],
    highlights: highlights.length > 0 ? highlights : undefined
  };
}

/**
 * Fetch all projects from Prismic repository.
 * Gracefully falls back to bundled static projects if repository is not set or network fails.
 */
export async function fetchProjects(): Promise<ProjectItem[]> {
  if (!client || !PRISMIC_REPO_NAME) {
    return FALLBACK_PROJECTS;
  }

  try {
    const response = await client.getAllByType('project', {
      orderings: {
        field: 'my.project.year',
        direction: 'desc'
      }
    });

    if (response && response.length > 0) {
      return response.map(mapPrismicProject);
    }
  } catch (err) {
    console.warn('[Prismic] Failed to fetch live projects, falling back to static dataset:', err);
  }

  return FALLBACK_PROJECTS;
}
