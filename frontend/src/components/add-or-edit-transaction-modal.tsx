'use client';

import api from '@/lib/api';
import type React from 'react';
import { useEffect, useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import type {
  Category,
  PaymentMethod,
  Transaction,
  TransactionType,
} from '@/lib/types';
import { useRefreshContext } from '@/context/PageRefreshContext';

interface AddOrEditTransactionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: Transaction | null;
}

export default function AddOrEditTransactionModal({
  open,
  onOpenChange,
  transaction,
}: AddOrEditTransactionModalProps) {
  const [type, setType] = useState<TransactionType>('income');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const { triggerRefresh } = useRefreshContext();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/categories');
        setCategories(response.data);
      } catch (error) {
        console.error('Erro ao buscar categorias:', error);
      }
    };

    if (open) {
      fetchCategories();
    }
    fetchCategories();
  }, [open]);

  useEffect(() => {
    if (transaction) {
      setType(transaction.transaction_type);
      setCategory(String(transaction.category.id));
      setDescription(transaction.description);
      setAmount(String(transaction.amount));
      setDate(transaction.transaction_date.split('T')[0]);
      setPaymentMethod(transaction.payment_method);
    } else {
      setType('income');
      setCategory('');
      setDescription('');
      setAmount('');
      setDate(new Date().toISOString().split('T')[0]);
      setPaymentMethod('pix');
    }
  }, [transaction]);

  useEffect(() => {
    if (categories.length > 0) {
      const filtered = categories.filter((cat) => cat.type === type);
      setFilteredCategories(filtered);
      if (category && !filtered.some((cat) => String(cat.id) === category)) {
        setCategory('');
      } else if (!category && filtered.length > 0) {
        setCategory(String(filtered[0].id));
      }
    }
  }, [type, categories, category, transaction]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const transactionData = {
        amount: parseFloat(amount),
        transaction_type: type.toUpperCase() as 'INCOME' | 'EXPENSE',
        payment_method: paymentMethod,
        description: description,
        transaction_date: date,
        category_id: parseInt(category),
      };

      if (transaction) {
        // Modo edição
        await api.put(`/transactions/${transaction.id}`, transactionData, {
          headers: {
            'Content-Type': 'application/json',
          }
        });
      } else {
        // Modo adição
        await api.post('/transactions', transactionData, {
          headers: {
            'Content-Type': 'application/json',
          }
        });
      }

      onOpenChange(false);
      triggerRefresh();
    } catch (error) {
      console.error('Erro ao salvar transação:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby={undefined} className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{transaction ? 'Editar Transação' : 'Adicionar Nova Transação'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            <Label>Tipo de Transação</Label>
            <RadioGroup
              value={type}
              onValueChange={(value) => setType(value as TransactionType)}
              className="flex space-x-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="income" id="income" />
                <Label htmlFor="income" className="text-green-600">
                  Receita
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="expense" id="expense" />
                <Label htmlFor="expense" className="text-red-600">
                  Despesa
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {filteredCategories.map((cat) => (
                  <SelectItem key={cat.id} value={String(cat.id)}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentMethod">Método de Pagamento</Label>
            <Select
              value={paymentMethod}
              onValueChange={(value) =>
                setPaymentMethod(value as PaymentMethod)
              }
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o método de pagamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pix">Pix</SelectItem>
                <SelectItem value="card">Cartão</SelectItem>
                <SelectItem value="cash">Dinheiro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              placeholder="Digite a descrição da transação"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="resize-none"
              maxLength={255}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Valor (R$)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0,00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Data</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="flex space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button type="submit" className="flex-1">
              Salvar Alterações
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
