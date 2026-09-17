import { getCollection, type CollectionEntry } from 'astro:content'

export type ResourceEntry = CollectionEntry<'resources'>
export type ResourceKind = ResourceEntry['data']['items'][number]['kind']

export const resourceKindLabels: Record<ResourceKind, string> = {
  website: '网站',
  document: '文档',
  tool: '工具',
  course: '课程',
  other: '其他'
}

export interface ResolvedResourceItem {
  title: string
  href: string
  description: string
  kind: ResourceKind
  prompt?: string
}

export interface ResolvedResourceGroup {
  entry: ResourceEntry
  items: ResolvedResourceItem[]
}

interface ResourceCatalog {
  groups: ResolvedResourceGroup[]
}

let catalogPromise: Promise<ResourceCatalog> | undefined

function normalizeHref(href: string) {
  const trimmed = href.trim()
  return trimmed.length > 1 ? trimmed.replace(/\/$/, '') : trimmed
}

function sortGroups(groups: ResolvedResourceGroup[]) {
  return groups.sort((a, b) => {
    const orderDifference = a.entry.data.order - b.entry.data.order
    if (orderDifference !== 0) return orderDifference

    return a.entry.data.title.localeCompare(b.entry.data.title, 'zh-CN')
  })
}

async function buildResourceCatalog(): Promise<ResourceCatalog> {
  const resourceEntries = await getCollection('resources')
  const visibleResources = resourceEntries.filter(({ data }) => !data.draft)
  const hrefOwners = new Map<string, string>()

  const groups = sortGroups(
    visibleResources.map((entry) => {
      const items = entry.data.items.map((item) => {
        const normalizedHref = normalizeHref(item.href)

        if (!entry.data.draft) {
          const previousOwner = hrefOwners.get(normalizedHref)
          if (previousOwner) {
            throw new Error(
              `[resources] 资源链接 "${item.href}" 重复出现。首次位置：${previousOwner}；重复位置：${entry.id} > ${item.title}。`
            )
          }
          hrefOwners.set(normalizedHref, `${entry.id} > ${item.title}`)
        }

        return {
          title: item.title,
          href: item.href,
          description: item.description,
          kind: item.kind,
          prompt: item.prompt
        }
      })

      return { entry, items }
    })
  )

  return { groups }
}

export async function getResourceGroups() {
  catalogPromise ??= buildResourceCatalog()
  return (await catalogPromise).groups
}
