'use client';

import api from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useEffect, useState, useCallback } from 'react';
import { Trash2, ArrowUpDown, Pen, Filter, XCircle } from 'lucide-react';
import type { Category, Pagination, Transaction } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
} from '@tanstack/react-table';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import {
  cn,
  translateTransactionType,
  formatDate,
  formatCurrencyBRL,
} from '@/lib/utils';
import AddOrEditTransactionModal from '@/components/add-or-edit-transaction-modal';
import DeleteConfirmationModal from '@/components/confirm-delete-transaction-modal';
import { useRefreshContext } from '@/context/PageRefreshContext';

export default function Transactions() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    total_pages: 1,
    current_page: 1,
    per_page: 20,
    total_items: 0,
  });
  const { refreshKey } = useRefreshContext();

  const fetchTransactions = useCallback(async () => {
    try {
      const response = await api.get('/transactions', {
        params: {
          search: searchTerm || undefined,
          type: typeFilter || undefined,
          category_id: categoryFilter || undefined,
          page: pagination.current_page,
          per_page: pagination.per_page,
        },
      });
      setTransactions(response.data.transactions);
      setPagination(response.data.pagination);
    } catch (error: any) {
      console.error('Erro ao buscar transações:', error);
    }
  }, [
    searchTerm,
    typeFilter,
    categoryFilter,
    pagination.current_page,
    pagination.per_page,
  ]);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data);
    } catch (error: any) {
      console.error('Erro ao buscar categorias:', error);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions, refreshKey]);

  const clearFilters = () => {
    setSearchTerm('');
    setTypeFilter('');
    setCategoryFilter('');
    setPagination((prev) => ({ ...prev, current_page: 1 }));
  };

  const handleEditClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (transactionId: number) => {
    setSelectedTransaction(
      transactions.find((t) => t.id === transactionId) || null
    );
    setIsDeleteModalOpen(true);
  };

  const columns: ColumnDef<Transaction>[] = [
    {
      accessorKey: 'transaction_type',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="p-0"
          >
            Tipo
            <ArrowUpDown className="ml-1 h-3 w-3" />{' '}
          </Button>
        );
      },
      cell: ({ row }) => {
        const type = row.getValue('transaction_type') as 'income' | 'expense';
        const typeClasses = cn(
          'px-2 py-1 rounded text-md font-medium w-fit whitespace-nowrap', // Adicionado whitespace-nowrap
          type === 'income'
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
        );
        return (
          <div className={typeClasses}>{translateTransactionType(type)}</div>
        );
      },
    },
    {
      accessorKey: 'description',
      header: 'Descrição',
      cell: ({ row }) => (
        <div className="font-medium text-left">
          {row.getValue('description')}
        </div>
      ),
    },
    {
      accessorKey: 'transaction_date',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Data
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div>{formatDate(row.getValue('transaction_date'))}</div>
      ),
    },
    {
      accessorKey: 'category.name',
      header: 'Categoria',
      cell: ({ row }) => {
        const category = row.original.category;
        return <div>{category ? category.name : 'N/A'}</div>;
      },
    },
    {
      accessorKey: 'amount',
      header: ({ column }) => {
        return (
          <div className="text-right">
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === 'asc')
              }
            >
              Valor
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
        );
      },
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue('amount'));
        const type = row.original.transaction_type;
        const amountColor =
          type === 'income' ? 'text-green-600' : 'text-red-600';
        const amountSign = type === 'income' ? '+' : '-';

        return (
          <div className={cn('text-right font-bold', amountColor)}>
            {amountSign}
            {formatCurrencyBRL(amount)}
          </div>
        );
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex space-x-1 justify-end">
          <Button variant="ghost" size="icon" className="h-8 w-9" onClick={() => handleEditClick(row.original)}>
            <Pen className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-9" onClick={() => handleDeleteClick(row.original.id)}>
            <Trash2 className="h-5 w-5" />
          </Button>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: transactions,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    state: {
      sorting,
      columnFilters,
    },
    manualPagination: true,
    manualFiltering: true,
    pageCount: pagination.total_pages,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col w-full">
          <h1 className="text-3xl font-bold">Transações</h1>
          <p className="text-muted-foreground">
            Visualize um relatório completo de todas as suas transações
            financeiras
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="flex items-center text-lg font-bold">
            <Filter className="h-5 w-5 mr-2" />
            Filtros
          </CardTitle>
          <Button
            variant="destructive"
            onClick={clearFilters}
            className="ml-auto text-destructive-foreground font-semibold"
          >
            <XCircle className="h-4 w-4" />
            Remover Filtros
          </Button>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4 justify-start items-end">
          {' '}
          {/* Alterado de grid para flex */}
          {/* Search Input */}
          <div className="flex-grow max-w-xs">
            {' '}
            {/* flex-grow para ocupar espaço, max-w-xs para limitar */}
            <label htmlFor="search" className="block text-md font-medium mb-1">
              Buscar por Descrição
            </label>
            <Input
              id="search"
              placeholder="Buscar transações..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>
          {/* Type Filter */}
          <div>
            {' '}
            {/* Sem flex-grow, largura definida pelo conteúdo/w-[180px] */}
            <label
              htmlFor="type-filter"
              className="block text-md font-medium mb-1"
            >
              Filtrar por Tipo
            </label>
            <Select
              value={typeFilter === '' ? 'all' : typeFilter}
              onValueChange={(value) =>
                setTypeFilter(value === 'all' ? '' : value)
              }
            >
              <SelectTrigger id="type-filter" className="w-[180px]">
                <SelectValue placeholder="Todos os Tipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Tipos</SelectItem>
                <SelectItem value="income">Receita</SelectItem>
                <SelectItem value="expense">Despesa</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* Category Filter */}
          <div>
            {' '}
            {/* Sem flex-grow, largura definida pelo conteúdo/w-[180px] */}
            <label
              htmlFor="category-filter"
              className="block text-md font-medium mb-1"
            >
              Filtrar por Categoria
            </label>
            <Select
              value={categoryFilter === '' ? 'all' : categoryFilter}
              onValueChange={(value) =>
                setCategoryFilter(value === 'all' ? '' : value)
              }
            >
              <SelectTrigger id="category-filter" className="w-[180px]">
                <SelectValue placeholder="Todas as Categorias" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Categorias</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={String(category.id)}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Todas as Transações ({pagination.total_items})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        className={cn(
                          header.column.id === 'transaction_type'
                            ? 'w-fit'
                            : '',
                          header.column.id === 'description' ? 'text-left' : ''
                        )}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && 'selected'}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          className={cn(
                            cell.column.id === 'transaction_type'
                              ? 'w-fit'
                              : '',
                            cell.column.id === 'description' ? 'text-left' : ''
                          )}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      Nenhuma transação encontrada.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-end space-x-2 py-4">
            <div className="flex-1 text-md text-muted-foreground">
              Página {pagination.current_page} de {pagination.total_pages} (
              {pagination.total_items} itens)
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setPagination((prev) => ({
                  ...prev,
                  current_page: prev.current_page - 1,
                }))
              }
              disabled={pagination.current_page <= 1}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setPagination((prev) => ({
                  ...prev,
                  current_page: prev.current_page + 1,
                }))
              }
              disabled={pagination.current_page >= pagination.total_pages}
            >
              Próxima
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Edit Transaction Modal */}
      {isEditModalOpen && (
        <AddOrEditTransactionModal
          open={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
          transaction={selectedTransaction}
        />
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <DeleteConfirmationModal
          open={isDeleteModalOpen}
          onOpenChange={setIsDeleteModalOpen}
          transactionId={selectedTransaction ? selectedTransaction.id : null}
        />
      )}
    </div>
  );
}
