import type { Metadata } from 'next'
import Link from 'next/link'
import fs from 'fs'
import path from 'path'
import { ArrowLeft, Calendar, Clock, Tag, ArrowRight, ChevronRight } from 'lucide-react'

interface Params {
  params: Promise<{ slug: string }>
}

interface Post {
  slug: string
  title: string
  excerpt: string
  date: string
  readTime: string
  tags: string[]
  category: string
  content: string
  ogImage?: string
}

function getPostBySlug(slug: string): Post | null {
  const filePath = path.join(process.cwd(), 'src/content/blog', `${slug}.md`)
  if (!fs.existsSync(filePath)) return null

  const raw = fs.readFileSync(filePath, 'utf-8')
  
  // Parse frontmatter
  const parts = raw.split('---\n')
  const frontmatterRaw = parts[1]
  const contentRaw = parts.slice(2).join('---\n').trim()

  const lines = frontmatterRaw.split('\n').filter(l => !l.startsWith('#'))
  const frontmatter: Record<string, string> = {}
  lines.forEach(line => {
    const colonIndex = line.indexOf(':')
    if (colonIndex > 0) {
      const key = line.substring(0, colonIndex).trim()
      const value = line.substring(colonIndex + 1).trim()
      frontmatter[key] = value
    }
  })

  return {
    slug,
    title: frontmatter.title || slug,
    excerpt: frontmatter.excerpt || '',
    date: frontmatter.date || '',
    readTime: frontmatter.readTime || '5 min',
    tags: frontmatter.tags ? frontmatter.tags.split(',').map(t => t.trim()) : [],
    category: frontmatter.category || 'General',
    content: contentRaw,
    ogImage: frontmatter.ogImage,
  }
}

function getAllSlugs(): string[] {
  const dir = path.join(process.cwd(), 'src/content/blog')
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir).filter(f => f.endsWith('.md')).map(f => f.replace('.md', ''))
}

function generateStaticParams(): { slug: string }[] {
  return getAllSlugs().map(slug => ({ slug }))
}

async function generateMetadata(params: Params): Promise<Metadata> {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) return { title: 'Post no encontrado — VendeT' }

  return {
    title: `${post.title} — Blog VendeT Venezuela`,
    description: post.excerpt,
    alternates: { canonical: `https://vendet.online/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `https://vendet.online/blog/${post.slug}`,
      siteName: 'VendeT-Venezuela',
      type: 'article',
      locale: 'es_VE',
    },
  }
}

function renderMarkdown(content: string): string {
  let html = content
  
  // Headers
  html = html.replace(/^### (.*$)/gm, '<h3 class="text-xl font-bold text-gray-800 mt-8 mb-4">$1</h3>')
  html = html.replace(/^## (.*$)/gm, '<h2 class="text-2xl font-bold text-gray-800 mt-10 mb-4">$1</h2>')
  html = html.replace(/^# (.*$)/gm, '<h1 class="text-3xl font-black text-gray-900 mt-8 mb-6">$1</h1>')

  // Bold and italic
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/_(.+?)_/g, '<em>$1</em>')

  // Lists
  html = html.replace(/^- (.*$)/gm, '<li class="ml-4 list-disc text-gray-700">$1</li>')
  html = html.replace(/(<li[^>]*>.*<\/li>\n?)+/g, '<ul class="space-y-1 my-4">$&</ul>')

  // Paragraphs
  html = html.replace(/\n\n/g, '</p><p class="text-gray-700 leading-relaxed my-4">')
  html = `<p class="text-gray-700 leading-relaxed my-4">${html}</p>`

  // Clean empty paragraphs
  html = html.replace(/<p class="[^"]*">\s*<\/p>/g, '')

  // Tables (preserve them)
  html = html.replace(/<p class="([^"]*)">(\|[\s\S]*?\|)<\/p>/g, '<div class="overflow-x-auto my-6"><table class="min-w-full border border-gray-200 rounded-lg">$2</table></div>')

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-brand-primary font-semibold hover:underline">$1</a>')

  return html
}

// Static pages for SSR
export default async function BlogPost({ params }: Params) {
  const { slug } = await params
  const post = getPostBySlug(slug)

  if (!post) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Post no encontrado</h1>
        <Link href="/blog" className="text-brand-primary hover:underline">
          ← Volver al blog
        </Link>
      </div>
    )
  }

  const categoryIcons: Record<string, string> = {
    'Precios': '💰',
    'Emprendimiento': '🚀',
    'Consejos': '💡',
    'Seguridad': '🛡️',
    'Tendencias': '📊',
  }

  const htmlContent = renderMarkdown(post.content)

  return (
    <article className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <nav className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-brand-primary">Inicio</Link>
            <ChevronRight size={14} />
            <Link href="/blog" className="hover:text-brand-primary">Blog</Link>
            <ChevronRight size={14} />
            <span className="text-gray-800 truncate">{post.title}</span>
          </nav>
        </div>
      </div>

      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-primary to-brand-dark py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4">
          <Link href="/blog" className="inline-flex items-center gap-2 text-blue-200 hover:text-white mb-6 transition">
            <ArrowLeft size={16} /> Volver al blog
          </Link>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">{categoryIcons[post.category] || '📝'}</span>
            <span className="text-sm font-semibold text-brand-accent bg-brand-accent/20 px-3 py-1 rounded-full">{post.category}</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-black text-white mb-4 leading-tight">{post.title}</h1>
          <p className="text-lg text-blue-200 mb-6">{post.excerpt}</p>
          <div className="flex items-center gap-6 text-sm text-white/60">
            <span className="flex items-center gap-2"><Calendar size={14} /> {post.date}</span>
            <span className="flex items-center gap-2"><Clock size={14} /> {post.readTime}</span>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div 
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="mt-10 pt-6 border-t">
            <div className="flex items-center gap-2 flex-wrap">
              {post.tags.map(tag => (
                <span key={tag} className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  <Tag size={12} /> {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* CTA */}
      <section className="bg-brand-dark py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-black text-white mb-3">¿Tienes algo para vender?</h2>
          <p className="text-gray-400 mb-6">Publica gratis en VendeT y llega a miles de compradores en toda Venezuela</p>
          <Link href="/publicar" className="inline-flex items-center gap-2 bg-brand-accent text-brand-primary px-8 py-3 rounded-xl font-bold text-lg hover:bg-accent/90 transition shadow-lg">
            Publicar gratis <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* More posts */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <h3 className="text-xl font-bold text-gray-800 mb-6">Más artículos</h3>
        <div className="grid md:grid-cols-2 gap-6">
          {getAllSlugs()
            .filter(s => s !== slug)
            .slice(0, 2)
            .map(s => {
              const other = getPostBySlug(s)
              if (!other) return null
              return (
                <Link key={s} href={`/blog/${s}`} className="group block bg-white rounded-xl border border-gray-100 p-5 hover:shadow-lg transition">
                  <h4 className="font-bold text-gray-800 group-hover:text-brand-primary mb-2">{other.title}</h4>
                  <p className="text-sm text-gray-600 line-clamp-2">{other.excerpt}</p>
                </Link>
              )
            })}
        </div>
      </section>
    </article>
  )
}
