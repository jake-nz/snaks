import type { SorterResult } from 'antd/es/table/interface'
import type { StringReference } from 'kysely'
import type { OrderByDirectionExpression } from 'kysely'
import type { SelectQueryBuilder } from 'kysely'
import { sql } from 'kysely'

export const totalCount = sql<number>`count(*) OVER()`.as('totalCount')

/**
 * Adds `totalCount` and applies LIMIT and OFFSET to query
 * @param query Kysely Query
 * @param page page number to return (default 1)
 * @param itemsPerPage number of items per page
 * @returns Kysely Query with pagination applied
 */
export const paginate = <DB, TB extends keyof DB, O>(
  query: SelectQueryBuilder<DB, TB, O>,
  page: number = 1,
  itemsPerPage: number = 25
) => {
  // No limit
  if (page === 1 && itemsPerPage === Infinity) return query.select(totalCount)

  return query
    .select(totalCount)
    .limit(itemsPerPage)
    .offset((page - 1) * itemsPerPage)
}

/**
 * Iterates over sorter (from AntDesign Table) yielding `[column, order]`
 * order will be "asc" or "desc"
 */
export const iterateSorter = function* <DB, TB extends keyof DB>(
  sorter: SorterResult<any>[]
) {
  for (const sort of sorter) {
    if (!sort.columnKey) continue
    const direction: OrderByDirectionExpression =
      sort.order === 'descend' ? 'desc' : 'asc'
    yield [sort.columnKey as StringReference<DB, TB>, direction] as const
  }
}
