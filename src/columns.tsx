import React from 'react'
import { RightOutlined } from '@ant-design/icons'
import { Button, Typography } from 'antd'
import Link from 'next/link'

const { Text } = Typography

export const idColumn = (basePath: string) => ({
  title: 'ID',
  dataIndex: 'id',
  key: 'id',
  render: (id: string) => (
    <Link href={`${basePath}/${id}`}>
      <Text code copyable ellipsis>
        {id}
      </Text>
    </Link>
  ),
  width: 120
})

type AnyObject = Record<PropertyKey, any>

export function detailsLinkColumn<RecordType = AnyObject>(
  path: string | ((record: RecordType) => string),
  label: string = 'Details'
) {
  return {
    dataIndex: 'id',
    key: 'id',
    render: (id: string, record: RecordType) => {
      let href: string
      if (typeof path === 'string') {
        href = path + id
      } else {
        href = path(record)
      }

      return (
        <Link href={href}>
          <Button size="small" type="link">
            {label} <RightOutlined />
          </Button>
        </Link>
      )
    },
    width: 115
  }
}
