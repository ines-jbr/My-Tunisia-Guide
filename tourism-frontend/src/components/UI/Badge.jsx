export default function Badge({ source }) {
  if (!source) return null
  const cls = { RAG: 'badge badge-rag', CAG: 'badge badge-cag', MCP: 'badge badge-mcp' }[source] || 'badge'
  return <span className={cls}>{source}</span>
}