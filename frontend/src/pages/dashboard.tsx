'use client';

import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { useEffect, useState, useCallback } from 'react';
import type { Transaction, TransactionsSummary } from '@/lib/types';
import AddOrEditTransactionModal from '@/components/add-or-edit-transaction-modal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DeleteConfirmationModal from '@/components/confirm-delete-transaction-modal';

import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Percent,
  Trash2,
  Pen,
} from 'lucide-react';

import {
  actualDate,
  formatCurrencyBRL,
  formatDate,
  translateTransactionPaymentMethod,
  translateTransactionType,
  cn,
} from '@/lib/utils';
import { useRefreshContext } from '@/context/PageRefreshContext';

export default function Dashboard() {
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>(
    []
  );
  const [summary, setSummary] = useState<TransactionsSummary>({
    type: '',
    start_date: '',
    end_date: '',
    total_income: 0,
    total_expense: 0,
    net_profit: 0,
    profit_margin: 0,
    profit_margin_percent: 0,
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const { refreshKey } = useRefreshContext();

  const fetchTransactions = useCallback(async () => {
    try {
      const response = await api.get('/api/transactions/recent');
      setRecentTransactions(response.data);
    } catch (error: any) {
      console.error('Erro ao buscar transações recentes:', error);
    }
  }, []);

  const fetchSummary = useCallback(async () => {
    try {
      const response = await api.get('/api/transactions/summary', {
        params: {
          type: 'daily',
        },
      });

      setSummary(response.data);
    } catch (error: any) {
      console.error('Erro ao buscar resumo financeiro:', error);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
    fetchSummary();
  }, [fetchTransactions, fetchSummary, refreshKey]);

  const handleEditClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (transactionId: number) => {
    setSelectedTransaction(recentTransactions.find(t => t.id === transactionId) || null);
    setIsDeleteModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col w-full">
          <h1 className="text-3xl font-bold">Painel Financeiro</h1>
          <div className="flex justify-between">
            <p className="text-muted-foreground">
              Monitore o desempenho financeiro do seu negócio no dia de hoje
            </p>
            <p className="text-muted-foreground">{actualDate()}</p>
          </div>
        </div>
      </div>

      {/* Métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-md font-medium">
              Receita Total de Hoje
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div
              className={cn(
                'text-2xl font-bold',
                summary.total_income >= 0 ? 'text-green-600' : 'text-red-600'
              )}
            >
              {formatCurrencyBRL(summary.total_income)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-md font-medium">
              Despesas Totais de Hoje
            </CardTitle>
            <TrendingDown className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div
              className={cn(
                'text-2xl font-bold',
                summary.total_expense >= 0 ? 'text-green-600' : 'text-red-600'
              )}
            >
              {formatCurrencyBRL(summary.total_expense)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-md font-medium">Lucro Líquido</CardTitle>
            <DollarSign className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div
              className={cn(
                'text-2xl font-bold',
                summary.net_profit >= 0 ? 'text-green-600' : 'text-red-600'
              )}
            >
              {formatCurrencyBRL(summary.net_profit)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-md font-medium">
              Margem de Lucro
            </CardTitle>
            <Percent className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div
              className={cn(
                'text-2xl font-bold',
                summary.profit_margin_percent >= 0
                  ? 'text-green-600'
                  : 'text-red-600'
              )}
            >
              {summary.profit_margin_percent}%
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="lg:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Transações Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentTransactions.length > 0 ? (
              recentTransactions.map((transaction) => {
                const isIncome = transaction.transaction_type === 'income';
                const typeClasses = cn(
                  'px-2 py-1 rounded text-sm font-medium',
                  isIncome
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                );
                const amountSign = isIncome ? '+' : '-';
                const amountColor = isIncome ? 'text-green-600' : 'text-red-600';

                return (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={typeClasses}>
                        {translateTransactionType(transaction.transaction_type)}
                      </div>
                      <div>
                        <p className="font-medium">{transaction.description || 'Sem descrição'}</p>
                        <p className="text-sm text-muted-foreground">
                          {translateTransactionPaymentMethod(
                            transaction.payment_method
                          )}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(transaction.transaction_date)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={cn('font-bold', amountColor)}>
                        {amountSign}
                        {formatCurrencyBRL(transaction.amount)}
                      </span>
                      <Button variant="ghost" size="icon" className="h-8 w-9 cursor-pointer" onClick={() => handleEditClick(transaction)}>
                        <Pen className="h-5 w-5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-9 cursor-pointer" onClick={() => handleDeleteClick(transaction.id)}>
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center text-muted-foreground py-4">
                Nenhuma transação recente encontrada.
              </div>
            )}
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
