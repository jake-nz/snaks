'use client'

import type { TableProps } from 'antd'
import { Result, Table } from 'antd'
import type { AnyObject } from 'antd/es/_util/type'
import type {
  ColumnsType,
  FilterValue,
  SortOrder,
  SorterResult
} from 'antd/es/table/interface'
import {
  ReadonlyURLSearchParams,
  usePathname,
  useRouter,
  useSearchParams
} from 'next/navigation'
import React, { Suspense } from 'react'
import useSWR from 'swr'
import type { Fetcher } from 'swr'
import type { AdminTableRecord, FetcherQuery, ListQuery } from './antAdminTypes'

const ITEMS_PER_PAGE = 25

type AdminTableProps<RecordType extends AdminTableRecord = AdminTableRecord> = {
  fetcher: Fetcher<RecordType[], FetcherQuery>
  swrKey: string
  columns: ColumnsType<RecordType>
  defaultFilters?: ListQuery['filters']
  defaultSorter?: SorterResult<RecordType>[]
} & Omit<TableProps<RecordType>, 'data'>

export const AdminTable = <
  RecordType extends AdminTableRecord = AdminTableRecord
>(
  props: AdminTableProps<RecordType>
) => {
  return (
    <Suspense fallback={<Table loading />}>
      <AdminTableComponent {...props} />
    </Suspense>
  )
}

export const AdminTableComponent = <
  RecordType extends AdminTableRecord = AdminTableRecord
>({
  fetcher,
  columns,
  loading,
  swrKey,
  defaultFilters,
  defaultSorter,
  ...props
}: AdminTableProps<RecordType>) => {
  // Default filters and sorter
  const defaults = { filters: defaultFilters, sorter: defaultSorter }
  // Get page, filters and sorter from URL. Update columns to show filtering and sorting
  const query = useListQuery(defaults)

  const updatedColumns = columns.map(c => updateColumn(c, query))

  // Get data
  const { data, error, isLoading } = useSWR<RecordType[], any, FetcherQuery>(
    { swrKey, ...query },
    fetcher
  )

  const pagination = { ...usePagination(data), ...props.pagination }

  // updates URL search query when table page, filters or sorter change
  const updateUrlQuery = useUpdateUrlQuery()

  if (error)
    return (
      <Result
        status="error"
        title="Error Loading Data"
        subTitle={error.message}
      />
    )

  return (
    <Table<RecordType>
      dataSource={data}
      columns={updatedColumns}
      loading={isLoading}
      tableLayout="auto"
      sticky={{ offsetHeader: 0 }}
      // scroll={{ x: 960 }}
      rowKey="id"
      pagination={pagination}
      onChange={updateUrlQuery}
      {...props}
    />
  )
}

/**
 * Serialise list query to URL params string
 */
const serializeQuery = (listQuery: ListQuery) => {
  const urlQuery = new URLSearchParams()
  if (listQuery.page && listQuery.page > 1)
    urlQuery.set('page', listQuery.page.toString())

  for (const column in listQuery.filters) {
    const filter = listQuery.filters[column]
    if (!filter) continue

    for (const value of filter) {
      if (value) urlQuery.append(column, value.toString())
    }
  }

  if (!Array.isArray(listQuery.sorter)) listQuery.sorter = [listQuery.sorter]
  for (const sorter of listQuery.sorter) {
    if (sorter.columnKey)
      urlQuery.append(
        'sort',
        sorter.columnKey.toString() + '.' + (sorter.order || 'none')
      )
  }

  return urlQuery.toString()
}

const getPage = (urlQuery: ReadonlyURLSearchParams | null) => {
  const page = urlQuery?.get('page') || '1'
  return parseInt(page)
}

/**
 * Get current pagination page
 */
const usePage = () => getPage(useSearchParams())

const getFilters = (urlQuery: ReadonlyURLSearchParams | null) => {
  if (!urlQuery) return null

  const filters: Record<string, FilterValue | null> = {}

  for (const key of urlQuery.keys()) {
    if (key === 'page') continue
    if (key === 'sort') continue

    const filter = urlQuery.getAll(key)
    if (!filter) continue

    filters[key] = filter
  }

  if (!Object.keys(filters).length) return null

  return filters
}

const getSorter = (urlQuery: ReadonlyURLSearchParams | null) => {
  if (!urlQuery) return null

  const sorter: SorterResult<any>[] = []

  for (const key of urlQuery.keys()) {
    if (key !== 'sort') continue

    let sorters = urlQuery.getAll(key)
    if (!sorters) continue

    for (const sort of sorters) {
      const [columnKey, order] = sort.split('.')

      sorter.push({
        columnKey,
        order: order === 'none' ? null : (order as SortOrder)
      })
    }
  }

  if (!sorter.length) return null

  return sorter
}

/**
 * Get filters, sorter and page for list view
 */
export const useListQuery = (defaults: Partial<ListQuery> = {}) => {
  const urlQuery = useSearchParams()
  return {
    filters: { ...defaults.filters, ...getFilters(urlQuery) } || {}, // This now concats the default with the url filters
    sorter: getSorter(urlQuery) || defaults.sorter || [],
    page: getPage(urlQuery)
  }
}

const updateColumn = <RecordType extends object = any>(
  column: ColumnsType<RecordType>[number],
  listQuery: {
    filters: Record<string, FilterValue | null>
    sorter: SorterResult<any>[]
  }
) => {
  if (!column.key) return column

  const filterable = column.filterDropdown || column.filters
  if (!column.sorter && !filterable) return column

  const updatedColumn = { ...column }

  if (column.sorter) {
    const key = column.key.toString()
    const sorter = listQuery.sorter.find(sorter => sorter.columnKey === key)
    if (sorter) updatedColumn.sortOrder = sorter.order
  }

  if (filterable) {
    const key = column.key!.toString()
    const filter = listQuery.filters[key]
    updatedColumn.filteredValue = filter ? filter : []
  }

  return updatedColumn
}

const useUpdateUrlQuery = <RecordType extends AnyObject>() => {
  const pathname = usePathname()
  const router = useRouter()

  const updateUrlQuery: TableProps<RecordType>['onChange'] = (
    pagination,
    filters,
    sorter
  ) => {
    const urlQuery = serializeQuery({
      page: pagination.current,
      filters,
      sorter: Array.isArray(sorter) ? sorter : [sorter]
    })
    // router.push('?' + urlQuery) seems like is should work but leads to things/%5Bid%5D?page=... instead of things/1?page=...

    const url = new URL(pathname || '/', 'http://h')
    return router.push(url.pathname + '?' + urlQuery)
  }

  return updateUrlQuery
}

const usePagination = <RecordType extends AdminTableRecord = AdminTableRecord>(
  data: RecordType[] | undefined
) => {
  const page = usePage()

  return {
    pageSize: ITEMS_PER_PAGE,
    showSizeChanger: false,
    total: data?.[0]?.totalCount,
    showTotal: (total: number) => `Total: ${total}`,
    current: page
  }
}
