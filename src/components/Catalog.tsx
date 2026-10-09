import { useMemo, useState } from 'react';
import { ArrowUpRight, CalendarRange, Image, MessageSquareText, Search, Signature, Tags } from 'lucide-react';
import { tools } from '../lib/registry';
import type { ToolDefinition } from '../lib/registry';
const icons = { message: MessageSquareText, calendar: CalendarRange, tag: Tags, image: Image, pen: Signature };
const categories = ['All tools', 'Business', 'Data', 'Images'] as const;
export default function Catalog() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('All tools');
  const shown = useMemo(() => tools.filter(tool => (category === 'All tools' || category === tool.category) && `${tool.name} ${tool.description} ${tool.keywords.join(' ')}`.toLowerCase().includes(search.toLowerCase().trim())), [search, category]);
  return <div className="catalog">
    <div className="catalog-filter-bar"><div className="catalog-categories" role="group" aria-label="Filter tools by category">{categories.map(cat => <button key={cat} className={`category-button ${cat === category ? 'active' : ''}`} aria-pressed={cat === category} onClick={() => setCategory(cat)} type="button">{cat}</button>)}</div><label className="search-wrap"><Search size={18} /><input aria-label="Search tools" placeholder="Search a tool..." value={search} onChange={e => setSearch(e.target.value)} /></label></div>
    {shown.length ? <div className="tool-grid">{shown.map(tool => <ToolCard key={tool.slug} tool={tool} />)}</div> : <div className="empty-catalog"><Search size={27}/><h3>No matching tools</h3><p>Try another keyword or category.</p><button className="btn ghost" onClick={() => {setCategory('All tools');setSearch('');}}>Clear filters</button></div>}
    <p className="tools-footnote"><span className="pulse-dot"></span> More tools are on the way. Every tool is free to use.</p>
  </div>;
}
function ToolCard({ tool }: {tool: ToolDefinition}) {
  const Icon = icons[tool.icon];
  return <a className={`tool-card tool-${tool.category.toLowerCase()}`} href={`/tools/${tool.slug}/`}>
    <div className="tool-card-top"><span className="tool-icon"><Icon size={23} strokeWidth={1.8}/></span><ArrowUpRight className="card-arrow" size={19} /></div>
    <div className="tool-info"><span className="tool-category">{tool.category} {tool.tag ? <span className="tool-tag">· {tool.tag}</span> : null}</span><h3>{tool.name}</h3><p>{tool.description}</p></div><div className="card-action">OPEN TOOL <span>→</span></div>
  </a>;
}
