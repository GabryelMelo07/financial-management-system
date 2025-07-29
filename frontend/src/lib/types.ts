export type Page = "dashboard" | "transactions" | "reports" | "insights";

export type TransactionType = 'income' | 'expense';
export type CategoryType = TransactionType;
export type PaymentMethod = 'pix' | 'card' | 'cash';

export interface Category {
  id: number;
  name: string;
  type: CategoryType;
}

export interface Pagination {
  total_pages: number;
  current_page: number;
  per_page: number;
  total_items: number;
}

export interface Differences {
  income_percent_change: number;
  expense_percent_change: number;
  net_profit_percent_change: number;
  profit_margin_percent_change: number;
}

export interface Transaction {
  id: number;
  amount: number;
  transaction_type: TransactionType;
  payment_method: PaymentMethod;
  description: string;
  transaction_date: string;
  category: Category;
}

export interface TransactionsSummary {
  type: string;
  start_date: string;
  end_date: string;
  total_income: number;
  total_expense: number;
  net_profit: number;
  profit_margin: number;
  profit_margin_percent: number;
  differences?: Differences;
}

interface MonthlyChartData {
  [day: string]: {
    incomes: number;
    expenses: number;
  };
}

interface AnnualChartData {
  [month: string]: {
    incomes: number;
    expenses: number;
  };
}

interface IncomesPieChartData {
  [category: string]: number;
}

interface ExpensesPieChartData {
  [category: string]: number;
}

export interface ChartsData {
  monthlyChart: MonthlyChartData;
  annualChart: AnnualChartData;
  incomesPieChart: IncomesPieChartData;
  expensesPieChart: ExpensesPieChartData;
}
