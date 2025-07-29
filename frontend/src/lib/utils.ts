import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function translateTransactionType(type: string): string {
  switch (type) {
    case "income":
      return "Receita";
    case "expense":
      return "Despesa";
    default:
      return type;
  }
}

export function translateTransactionPaymentMethod(type: string): string {
  switch (type) {
    case "pix":
      return "Pix";
    case "card":
      return "Cartão";
    case "cash":
      return "Dinheiro";
    default:
      return type;
  }
}

export function formatDate(date: string): string {
  const data = new Date(date);
  const formatado = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(data);

  return (
    formatado.charAt(0).toUpperCase() + formatado.slice(1)
  );
};

export function actualDate(): string {
  const data = new Date();
  return formatDate(data.toISOString());
}

export function formatCurrencyBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export const monthNames: Record<string, string> = {
  january: 'Jan',
  february: 'Fev',
  march: 'Mar',
  april: 'Abr',
  may: 'Mai',
  june: 'Jun',
  july: 'Jul',
  august: 'Ago',
  september: 'Set',
  october: 'Out',
  november: 'Nov',
  december: 'Dez',
};
