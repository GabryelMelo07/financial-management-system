import api from '@/lib/api';
import { cn, formatCurrencyBRL, monthNames } from '@/lib/utils';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ChartsData, TransactionsSummary } from '@/lib/types';
import { TrendingUp, TrendingDown, DollarSign, Percent } from 'lucide-react';

import {
  LabelList,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
  Pie,
  PieChart,
} from 'recharts';

import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useRefreshContext } from '@/context/PageRefreshContext';

const chartConfig = {
  receita: {
    label: 'Receita',
    color: 'hsl(var(--chart-1))',
  },
  despesa: {
    label: 'Despesa',
    color: 'hsl(var(--chart-2))',
  },
  value: {
    label: 'Valor',
  },
} satisfies ChartConfig;

const RED_PIE_COLORS = [
  'oklch(0.5 0.25 29.5)',
  'oklch(0.4 0.25 29.5)',
  'oklch(0.75 0.25 29.5)',
  'oklch(0.85 0.25 29.5)',
  'oklch(0.9 0.25 29.5)',
];

const GREEN_PIE_COLORS = [
  '#22c55e', // verde claro
  '#16a34a', // verde médio
  '#15803d', // verde escuro
  '#4ade80', // verde pastel
  '#86efac', // verde suave
];

export default function Reports() {
  const [monthlySummary, setMonthlySummary] = useState<TransactionsSummary>({
    type: '',
    start_date: '',
    end_date: '',
    total_income: 0,
    total_expense: 0,
    net_profit: 0,
    profit_margin: 0,
    profit_margin_percent: 0,
    differences: {
      income_percent_change: 0,
      expense_percent_change: 0,
      net_profit_percent_change: 0,
      profit_margin_percent_change: 0,
    },
  });

  const [chartsData, setChartsData] = useState<ChartsData | null>(null);
  const { refreshKey } = useRefreshContext();

  const fetchSummaryData = useCallback(async () => {
    try {
      const response = await api.get('/transactions/summary', {
        params: {
          type: 'monthly',
        },
      });
      setMonthlySummary(response.data);
    } catch (error) {
      console.error('Erro ao buscar resumo mensal:', error);
    }
  }, []);

  const fetchChartsData = useCallback(async () => {
    try {
      const response = await api.get<ChartsData>('/transactions/charts');
      setChartsData(response.data);
    } catch (error) {
      console.error('Erro ao buscar dados dos gráficos:', error);
    }
  }, []);

  useEffect(() => {
    fetchSummaryData();
    fetchChartsData();
  }, [fetchSummaryData, fetchChartsData, refreshKey]);

  // Transformar dados do gráfico mensal
  const transformedMonthlyData = useMemo(() => {
    if (!chartsData?.monthlyChart) return [];
    const sortedDays = Object.keys(chartsData.monthlyChart).sort(
      (a, b) => parseInt(a, 10) - parseInt(b, 10)
    );

    return sortedDays.map((day) => ({
      day: day,
      receita: chartsData.monthlyChart[day].incomes,
      despesa: chartsData.monthlyChart[day].expenses,
    }));
  }, [chartsData]);

  // Transformar dados do gráfico anual
  const transformedAnnualData = useMemo(() => {
    if (!chartsData?.annualChart) return [];
    return Object.keys(chartsData.annualChart).map((monthKey) => ({
      month: monthNames[monthKey] || monthKey,
      receita: chartsData.annualChart[monthKey].incomes,
      despesa: chartsData.annualChart[monthKey].expenses,
    }));
  }, [chartsData]);

  // Config dos gráficos de categorias
  const incomesPieChartConfig = useMemo(() => {
    if (!chartsData?.incomesPieChart) return {};
    const config: ChartConfig = {};
    Object.keys(chartsData.incomesPieChart).forEach((categoryName, index) => {
      config[categoryName] = {
        label: categoryName,
        color: GREEN_PIE_COLORS[index % GREEN_PIE_COLORS.length],
      };
    });
    return config;
  }, [chartsData]);

  const expensesPieChartConfig = useMemo(() => {
    if (!chartsData?.expensesPieChart) return {};
    const config: ChartConfig = {};
    Object.keys(chartsData.expensesPieChart).forEach((categoryName, index) => {
      config[categoryName] = {
        label: categoryName,
        color: RED_PIE_COLORS[index % RED_PIE_COLORS.length],
      };
    });
    return config;
  }, [chartsData]);

  // Transformar dados dos gráficos de categorias
  const transformedIncomesPieData = useMemo(() => {
    if (!chartsData?.incomesPieChart) return [];
    return Object.keys(chartsData.incomesPieChart)
      .map((categoryName, index) => ({
        name: categoryName,
        value: chartsData.incomesPieChart[categoryName],
        fill: GREEN_PIE_COLORS[index % GREEN_PIE_COLORS.length],
      }))
      .filter((item) => item.value > 0);
  }, [chartsData]);

  const transformedExpensesPieData = useMemo(() => {
    if (!chartsData?.expensesPieChart) return [];
    return Object.keys(chartsData.expensesPieChart)
      .map((categoryName) => ({
        name: categoryName,
        value: chartsData.expensesPieChart[categoryName],
        fill: `var(--color-${categoryName})`,
      }))
      .filter((item) => item.value > 0);
  }, [chartsData]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Relatórios Financeiros</h1>
          <p className="text-muted-foreground">
            Analise o desempenho financeiro da sua oficina
          </p>
        </div>
      </div>

      {/* Métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-md font-medium">
              Receita Mensal
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div
              className={cn(
                'text-2xl font-bold',
                monthlySummary.total_income >= 0
                  ? 'text-green-600'
                  : 'text-red-600'
              )}
            >
              {formatCurrencyBRL(monthlySummary.total_income)}
            </div>
            {monthlySummary.differences && (
              <p
                className={cn(
                  'text-xs',
                  monthlySummary.differences.income_percent_change >= 0
                    ? 'text-green-600'
                    : 'text-red-600'
                )}
              >
                {monthlySummary.differences.income_percent_change.toFixed(1)}%
                em relação ao mês anterior
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-md font-medium">
              Despesa Mensal
            </CardTitle>
            <TrendingDown className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div
              className={cn(
                'text-2xl font-bold',
                monthlySummary.total_expense <= 0
                  ? 'text-red-600'
                  : 'text-green-600'
              )}
            >
              {formatCurrencyBRL(monthlySummary.total_expense)}
            </div>
            {monthlySummary.differences && (
              <p
                className={cn(
                  'text-xs',
                  monthlySummary.differences.expense_percent_change > 0
                    ? 'text-red-600'
                    : 'text-green-600'
                )}
              >
                {monthlySummary.differences.expense_percent_change.toFixed(1)}%
                em relação ao mês anterior
              </p>
            )}
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
                monthlySummary.net_profit >= 0
                  ? 'text-green-600'
                  : 'text-red-600'
              )}
            >
              {formatCurrencyBRL(monthlySummary.net_profit)}
            </div>
            {monthlySummary.differences && (
              <p
                className={cn(
                  'text-xs',
                  monthlySummary.differences.net_profit_percent_change >= 0
                    ? 'text-green-600'
                    : 'text-red-600'
                )}
              >
                {monthlySummary.differences.net_profit_percent_change.toFixed(
                  1
                )}
                % em relação ao mês anterior
              </p>
            )}
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
                monthlySummary.profit_margin_percent >= 0
                  ? 'text-green-600'
                  : 'text-red-600'
              )}
            >
              {monthlySummary.profit_margin_percent.toFixed(1)}%
            </div>
            {monthlySummary.differences && (
              <p
                className={cn(
                  'text-xs',
                  monthlySummary.differences.profit_margin_percent_change >= 0
                    ? 'text-green-600'
                    : 'text-red-600'
                )}
              >
                {monthlySummary.differences.profit_margin_percent_change.toFixed(
                  1
                )}
                % em relação ao mês anterior
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Monthly Income and Expense Bar Chart (Diário) */}
      <Card className="col-span-1 md:col-span-2 lg:col-span-3">
        <CardHeader>
          <CardTitle>Receitas e Despesas Diárias</CardTitle>
          <CardDescription>
            Visão geral de receitas e despesas por dia do mês atual
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
            <BarChart
              accessibilityLayer
              data={transformedMonthlyData}
              margin={{
                top: 20,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="day"
                tickLine={true}
                tickMargin={10}
                axisLine={true}
                textAnchor="end"
                height={60}
                interval={0}
              />
              <YAxis
                tickFormatter={(value) => formatCurrencyBRL(value)}
                width={80}
              />{' '}
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    formatter={(value: any, name: string | number) => {
                      const label =
                        name === 'receita' ? ' Receita' : ' Despesa';
                      return [`${formatCurrencyBRL(Number(value))}`, label] as [
                        string,
                        string
                      ];
                    }}
                  />
                }
              />
              <Bar dataKey="receita" fill="#22c55e" radius={4}>
                <LabelList
                  position="top"
                  offset={12}
                  className="fill-foreground"
                  fontSize={12}
                  formatter={(value: number) =>
                    value === 0 ? '' : formatCurrencyBRL(value)
                  }
                />
              </Bar>
              <Bar dataKey="despesa" fill="#ef4444" radius={4}>
                <LabelList
                  position="top"
                  offset={12}
                  className="fill-foreground"
                  fontSize={12}
                  formatter={(value: number) =>
                    value === 0 ? '' : formatCurrencyBRL(value)
                  }
                />
              </Bar>
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Pizza - Receitas por Categoria */}
        <Card className="flex flex-col">
          <CardHeader className="items-center pb-0">
            <CardTitle>Receitas por Categoria</CardTitle>
            <CardDescription>
              Distribuição das receitas por categoria no mês atual
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-0">
            <ChartContainer
              config={incomesPieChartConfig}
              className="[&_.recharts-text]:fill-foreground mx-auto aspect-square max-h-[250px]"
            >
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      nameKey="name"
                      formatter={(
                        value: any,
                        name: string | number,
                        entry: any
                      ) => {
                        const categoryName =
                          entry?.payload?.name ?? String(name);
                        return [
                          `${formatCurrencyBRL(Number(value))} `,
                          categoryName,
                        ];
                      }}
                    />
                  }
                />
                <Pie
                  data={transformedIncomesPieData}
                  dataKey="value"
                  nameKey="name"
                  stroke="var(--color-card)"
                >
                  <LabelList
                    dataKey="name"
                    className="fill-foreground"
                    stroke="none"
                    fontSize={12}
                    formatter={(value: number, entry: any) => {
                      const name = entry?.payload?.name ?? '';
                      return value > 0
                        ? `${name}: ${formatCurrencyBRL(Number(value))}`
                        : '';
                    }}
                  />
                </Pie>
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Gráfico de Pizza - Despesas por Categoria */}
        <Card className="flex flex-col">
          <CardHeader className="items-center pb-0">
            <CardTitle>Despesas por Categoria</CardTitle>
            <CardDescription>
              Distribuição das despesas por categoria no mês atual
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-0">
            <ChartContainer
              config={expensesPieChartConfig}
              className="[&_.recharts-text]:fill-foreground mx-auto aspect-square max-h-[250px]"
            >
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      nameKey="name"
                      formatter={(
                        value: any,
                        name: string | number,
                        entry: any
                      ) => {
                        const categoryName =
                          entry?.payload?.name ?? String(name);
                        return [
                          `${formatCurrencyBRL(Number(value))} `,
                          categoryName,
                        ];
                      }}
                    />
                  }
                />
                <Pie
                  data={transformedExpensesPieData}
                  dataKey="value"
                  nameKey="name"
                  stroke="var(--color-card)"
                >
                  <LabelList
                    dataKey="name"
                    className="fill-foreground"
                    stroke="none"
                    fontSize={12}
                    formatter={(value: number, entry: any) => {
                      const name = entry?.payload?.name ?? '';
                      return value > 0
                        ? `${name}: ${formatCurrencyBRL(Number(value))}`
                        : '';
                    }}
                  />
                </Pie>
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Annual Income and Expense Bar Chart (Anual) */}
      <Card className="col-span-1 md:col-span-2 lg:col-span-3">
        <CardHeader>
          <CardTitle>Receitas e Despesas Anuais</CardTitle>
          <CardDescription>
            Visão geral de receitas e despesas por mês do ano atual
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
            <BarChart
              accessibilityLayer
              data={transformedAnnualData}
              margin={{
                top: 20,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />
              <YAxis
                tickFormatter={(value) => formatCurrencyBRL(value)}
                width={80}
              />{' '}
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    formatter={(value: any, name: string | number) => {
                      const label =
                        name === 'receita' ? ' Receita' : ' Despesa';
                      return [`${formatCurrencyBRL(Number(value))}`, label] as [
                        string,
                        string
                      ];
                    }}
                  />
                }
              />
              <Bar dataKey="receita" fill="#22c55e" radius={4}>
                <LabelList
                  position="top"
                  offset={12}
                  className="fill-foreground"
                  fontSize={12}
                  formatter={(value: number) =>
                    value === 0 ? '' : formatCurrencyBRL(value)
                  }
                />
              </Bar>
              <Bar dataKey="despesa" fill="#ef4444" radius={4}>
                <LabelList
                  position="top"
                  offset={12}
                  className="fill-foreground"
                  fontSize={12}
                  formatter={(value: number) =>
                    value === 0 ? '' : formatCurrencyBRL(value)
                  }
                />
              </Bar>
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
