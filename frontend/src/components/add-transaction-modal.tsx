"use client"

import type React from "react"
import { useState } from "react"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface AddTransactionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function AddTransactionModal({ open, onOpenChange }: AddTransactionModalProps) {
  const [type, setType] = useState("receita")
  const [category, setCategory] = useState("")
  const [description, setDescription] = useState("")
  const [amount, setAmount] = useState("")
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Aqui você adicionaria a lógica para salvar a transação
    console.log({ type, category, description, amount, date })
    onOpenChange(false)
    // Reset form
    setType("receita")
    setCategory("")
    setDescription("")
    setAmount("")
    setDate(new Date().toISOString().split("T")[0])
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar Transação</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            <Label>Tipo de Transação</Label>
            <RadioGroup value={type} onValueChange={setType} className="flex space-x-6">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="receita" id="receita" />
                <Label htmlFor="receita" className="text-green-600">
                  Receita
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="despesa" id="despesa" />
                <Label htmlFor="despesa" className="text-red-600">
                  Despesa
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger className="border-[#FF0000] focus:ring-[#FF0000]">
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {type === "receita" ? (
                  <>
                    <SelectItem value="vendas">Vendas</SelectItem>
                    <SelectItem value="servicos">Serviços</SelectItem>
                    <SelectItem value="outros">Outros</SelectItem>
                  </>
                ) : (
                  <>
                    <SelectItem value="estoque">Estoque</SelectItem>
                    <SelectItem value="operacional">Operacional</SelectItem>
                    <SelectItem value="equipamentos">Equipamentos</SelectItem>
                    <SelectItem value="outros">Outros</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* TEXT AREA QUEBRANDO O MODAL AO PASSAR DO LIMITE */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              placeholder="Digite a descrição da transação"
              value={description}
              onChange={(e: any) => setDescription(e.target.value)}
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
            <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>

          <div className="flex space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" className="flex-1 bg-[#FF0000] hover:bg-[#CC0000]">
              Adicionar Transação
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
