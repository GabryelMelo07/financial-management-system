import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, Percent } from "lucide-react";

const monthlyData = [
  { month: "Jan", receita: 1500, despesa: 1000 },
  { month: "Fev", receita: 1800, despesa: 1200 },
  { month: "Mar", receita: 1600, despesa: 1400 },
  { month: "Abr", receita: 2000, despesa: 1600 },
  { month: "Mai", receita: 1700, despesa: 3300 },
];

const categoryData = [
  { name: "Venda de Pneus", value: 1200, color: "#22c55e" },
  { name: "Serviços de Freio", value: 350, color: "#3b82f6" },
  { name: "Troca de Óleo", value: 150, color: "#f59e0b" },
];

const expenseData = [
  { name: "Aluguel", value: 2500, color: "#ef4444" },
  { name: "Estoque", value: 800, color: "#f97316" },
];

export default function Reports() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Relatórios Financeiros</h1>
          <p className="text-muted-foreground">
            Analise o desempenho financeiro da sua oficina
          </p>
        </div>
        <Select defaultValue="all">
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Todo o Período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todo o Período</SelectItem>
            <SelectItem value="month">Este Mês</SelectItem>
            <SelectItem value="quarter">Este Trimestre</SelectItem>
            <SelectItem value="year">Este Ano</SelectItem>
          </SelectContent>
        </Select>
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
              +12,5% em relação ao período anterior
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
              +8,2% em relação ao período anterior
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
              -15,3% em relação ao período anterior
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
              +2,1% em relação ao período anterior
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Tendência */}
      <Card>
        <CardHeader>
          <CardTitle>Tendência Financeira Mensal</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="receita"
                stroke="#22c55e"
                strokeWidth={2}
                name="Receita"
              />
              <Line
                type="monotone"
                dataKey="despesa"
                stroke="#ef4444"
                strokeWidth={2}
                name="Despesa"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Receita vs Despesas */}
        <Card>
          <CardHeader>
            <CardTitle>Receita vs Despesas</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="receita" fill="#22c55e" name="Receita" />
                <Bar dataKey="despesa" fill="#ef4444" name="Despesa" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gastos por Categoria */}
        <Card>
          <CardHeader>
            <CardTitle>Gastos por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold mb-3">
                  Principais Categorias de Receita
                </h4>
                <div className="space-y-2">
                  {categoryData.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center"
                    >
                      <span className="text-sm">{item.name}</span>
                      <span className="font-semibold text-green-600">
                        R${item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">
                  Principais Categorias de Despesa
                </h4>
                <div className="space-y-2">
                  {expenseData.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center"
                    >
                      <span className="text-sm">{item.name}</span>
                      <span className="font-semibold text-red-600">
                        R${item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
