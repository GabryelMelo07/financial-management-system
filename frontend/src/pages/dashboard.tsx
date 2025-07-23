import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Percent,
  Eye,
  Trash2,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const recentTransactions = [
  {
    id: 1,
    type: 'receita',
    title: 'Venda de Pneus',
    description: 'Venda de 4 pneus para Toyota Corolla',
    date: '14/01/2024',
    amount: 1200,
  },
  {
    id: 2,
    type: 'despesa',
    title: 'Estoque',
    description: 'Compra de pneus para estoque',
    date: '13/01/2024',
    amount: -800,
  },
  {
    id: 3,
    type: 'receita',
    title: 'Serviços de Freio',
    description: 'Troca de pastilhas de freio',
    date: '12/01/2024',
    amount: 350,
  },
  {
    id: 4,
    type: 'despesa',
    title: 'Aluguel',
    description: 'Aluguel mensal da oficina',
    date: '31/12/2023',
    amount: -2500,
  },
  {
    id: 5,
    type: 'receita',
    title: 'Troca de Óleo',
    description: 'Troca de óleo e filtro',
    date: '11/01/2024',
    amount: 150,
  },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Painel Financeiro</h1>
          <p className="text-muted-foreground">
            Monitore o desempenho financeiro da sua oficina
          </p>
        </div>
      </div>

      {/* Métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$1.700</div>
            <p className="text-xs text-green-600">
              +12,5% em relação ao mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Despesas Totais
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$3.300</div>
            <p className="text-xs text-red-600">
              +8,2% em relação ao mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lucro Líquido</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$-1.600</div>
            <p className="text-xs text-red-600">
              -15,3% em relação ao mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Margem de Lucro
            </CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-94.1%</div>
            <p className="text-xs text-green-600">
              +2,1% em relação ao mês anterior
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="lg:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Transações Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-3 rounded-lg border"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      transaction.type === 'receita'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}
                  >
                    {transaction.type}
                  </div>
                  <div>
                    <p className="font-medium">{transaction.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {transaction.description}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {transaction.date}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`font-bold ${
                      transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {transaction.amount > 0 ? '+' : ''}
                    {Math.abs(transaction.amount).toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
