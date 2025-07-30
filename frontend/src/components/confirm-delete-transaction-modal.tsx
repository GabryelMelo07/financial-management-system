'use client';

import api from '@/lib/api';
import { Button } from '@/components/ui/button';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { useRefreshContext } from '@/context/PageRefreshContext';

interface DeleteConfirmationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transactionId: number | null;
}

export default function DeleteConfirmationModal({
  open,
  onOpenChange,
  transactionId,
}: DeleteConfirmationModalProps) {
  const { triggerRefresh } = useRefreshContext();

  const handleDelete = async () => {
    if (transactionId === null) return;

    try {
      await api.delete(`/api/transactions/${transactionId}`);
      onOpenChange(false);
      triggerRefresh();
    } catch (error) {
      console.error('Erro ao deletar transação:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Confirmar Exclusão</DialogTitle>
          <DialogDescription>
            Tem certeza de que deseja excluir esta transação? Esta ação não pode
            ser desfeita.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            className="cursor-pointer"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            className="cursor-pointer text-destructive-foreground hover:bg-destructive/75 hover:text-destructive-foreground/75"
            onClick={handleDelete}
          >
            Excluir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
