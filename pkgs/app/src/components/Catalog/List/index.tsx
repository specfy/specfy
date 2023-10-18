import { IconBox } from '@tabler/icons-react';
import {
  getCoreRowModel,
  useReactTable,
  flexRender,
} from '@tanstack/react-table';
import classNames from 'classnames';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';

import type { ApiOrg, CatalogItem } from '@specfy/models';
import type { AllowedKeys } from '@specfy/stack-analyser';

import { supportedIndexed } from '@/common/techs';
import { Flex } from '@/components/Flex';
import { TooltipFull } from '@/components/Tooltip';
import * as Table from '@/components/ui/DataTable';
import { Progress } from '@/components/ui/Progress';

import cls from './index.module.scss';

import type { ColumnDef } from '@tanstack/react-table';

export type Row = CatalogItem & {
  totalProjects: number;
  pct: number;
};

export const List: React.FC<{
  org: ApiOrg;
  data: CatalogItem[];
  totalProjects: number;
  size?: 's' | 'm';
}> = ({ org, data, totalProjects, size = 'm' }) => {
  const processed = useMemo<Row[]>(() => {
    return data.map((row) => {
      const pct = Math.round((row.count / totalProjects) * 100);

      return { ...row, totalProjects, pct };
    });
  }, [data, totalProjects]);

  const columns = useMemo<Array<ColumnDef<Row>>>(() => {
    return [
      {
        accessorKey: 'key',
        header: 'Name',
        size: size === 'm' ? 700 : 700,
        cell: ({ row }) => {
          const key = row.getValue<string>('key');
          const tech =
            key in supportedIndexed && supportedIndexed[key as AllowedKeys];
          const Icon = tech && tech.Icon ? tech.Icon : IconBox;
          return (
            <Link to={`/${org.id}/_/catalog/${key}`}>
              <Flex gap="l" style={{ width: '100%' }}>
                <Icon size="1em" />
                {tech ? tech.name : key}
              </Flex>
            </Link>
          );
        },
      },
      {
        accessorKey: 'count',
        header: 'Projects',
        maxSize: 112,
        enableGlobalFilter: true,
        cell: ({ row }) => {
          return (
            <div>
              <TooltipFull
                msg={`${row.original.count} out of ${row.original.totalProjects} projects`}
                side="right"
              >
                <div className={cls.stat}>
                  <div className={cls.tag}>{row.original.pct}%</div>
                  <Progress value={row.original.pct} />
                </div>
              </TooltipFull>
            </div>
          );
        },
      },
    ];
  }, []);

  const table = useReactTable({
    data: processed,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Table.Table className={classNames(cls.table, cls[size])}>
      <Table.Header>
        {table.getHeaderGroups().map((headerGroup) => (
          <Table.Row key={headerGroup.id}>
            {headerGroup.headers.map((header) => {
              return (
                <Table.Head
                  key={header.id}
                  style={{
                    width: header.getSize(),
                  }}
                >
                  {size === 's' || header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </Table.Head>
              );
            })}
          </Table.Row>
        ))}
      </Table.Header>
      <Table.Body>
        {table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map((row) => (
            <Table.Row
              key={row.id}
              data-state={row.getIsSelected() && 'selected'}
            >
              {row.getVisibleCells().map((cell) => (
                <Table.Cell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </Table.Cell>
              ))}
            </Table.Row>
          ))
        ) : (
          <Table.Row>
            <Table.Cell colSpan={columns.length} className="h-24 text-center">
              No results.
            </Table.Cell>
          </Table.Row>
        )}
      </Table.Body>
    </Table.Table>
  );
};
