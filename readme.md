Useful in a project that uses all of:

- `S`WR for data fetching
- `N`extJS
- `A`nt Design tables
- `K`ysely with Postgres Sorting, Filtering and Pagination in the database
- `s` (`snak` was already claimed on NPM)

## `AdminTable`

- Wraps Ant Design Table
- Gets page, filters and sorting from URL query
- Sets page, filters and sorting on URL query when changed by user
- Updates columns to reflect current filtering and sorting
- Fetches data, passing page, filters and sorting
- Adds pagination options, including total count from data
- Shows Loading state

## `kyselyUtils`

### `totalCount`

An SQL snippet to add to a `select` so we get the total number of results the query would return if not paginated. This does add a performance hit.

```TS
database.selectFrom('table').select(totalCount)...
```

### `paginate`

Adds `totalCount` and applies `LIMIT` and `OFFSET` to query

```TS
query = database.selectFrom('table')...
return paginate(query)
```

### `iterateSorter`

Iterates over sorter (from AntDesign Table) yielding `[column, order]`

```TS
for (const sort of iterateSorter(sorter)) {
  const [column, direction] = sort
  switch (column) {
    case 'date':
      query = query.orderBy('createdAt', direction)
      break
    case 'name':
      query = query.orderBy('firstName', direction).orderBy('lastName', direction)
  }
}
```

TODO

- Move ErrorLoding in here
