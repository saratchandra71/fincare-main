
// src/lib/pillars.ts
export type Pillar = 'products-services' | 'price-value' | 'consumer-understanding' | 'consumer-support' | null

export function pillarForCategory(category?: string): Pillar {
  const c = (category || '').toLowerCase()
  if (c.includes('products & services')) return 'products-services'
  if (c.includes('price & value')) return 'price-value'
  if (c.includes('consumer understanding')) return 'consumer-understanding'
  if (c.includes('consumer support')) return 'consumer-support'
  return null
}
