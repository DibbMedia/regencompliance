/**
 * ItemList builder for hub pages (specialty hub, tools hub, blog hub,
 * glossary index, state hub, compare hub). Position is 1-indexed; URLs must
 * be absolute.
 */
export interface ItemListEntry {
  name: string
  url: string
  description?: string
}

export interface ItemListSchema extends Record<string, unknown> {
  "@context": "https://schema.org"
  "@type": "ItemList"
  itemListElement: Array<{
    "@type": "ListItem"
    position: number
    url: string
    name: string
    description?: string
  }>
}

export function buildItemListSchema(items: ItemListEntry[]): ItemListSchema {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: item.url,
      name: item.name,
      ...(item.description ? { description: item.description } : {}),
    })),
  }
}
