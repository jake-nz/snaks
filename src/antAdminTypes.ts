import type { FilterValue, SorterResult } from 'antd/es/table/interface'

/** Query for a page of an AdminTable */
export type ListQuery = {
  page?: number
  limit?: number
  filters: Record<string, FilterValue | null>
  sorter: SorterResult<any>[]

  swrKey?: string
}

// Base for data in an AdminTable - must include totalCount for pagination
export type AdminTableRecord = { totalCount: number }

/**
 * Query sent to data fetcher
 * Must include `swrKey` to differentiate in SWR cache
 */
export type FetcherQuery = { swrKey: string } & ListQuery
