"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Filter, Calendar, Users, Building, Coffee, DollarSign, MapPin, Clock } from "lucide-react"

export default function AdvancedFiltersModal({ isOpen, onClose, filters, onFiltersChange, agendamentos }) {
  const [localFilters, setLocalFilters] = useState(filters)

  useEffect(() => {
    setLocalFilters(filters)
  }, [filters])

  const handleFilterChange = (key, value) => {
    setLocalFilters((prev) => ({ ...prev, [key]: value }))
  }

  const applyFilters = () => {
    onFiltersChange(localFilters)
    onClose()
  }

  const clearFilters = () => {
    const emptyFilters = {
      nome: "",
      email: "",
      tipoAgendamento: "",
      status: "",
      tipoServico: "",
      timeSetor: "",
      centroCusto: "",
      turno: "",
      refeitorio: "",
      cardapio: "",
      dataInicio: null,
      dataFim: null,
      dataCoffee: null,
      data: null,
      quantidadeMin: "",
      quantidadeMax: "",
      localEntrega: "",
      rateio: "",
      acompanhante: "",
      nomeVisitante: "",
      dia: "",
      isFeriado: "",
      refeicoes: "",
    }
    setLocalFilters(emptyFilters)
  }

  // Extrair valores únicos dos agendamentos para os selects
  const getUniqueValues = (field) => {
    const values = agendamentos
      .map((a) => a[field])
      .filter((v) => v && v !== "")
      .filter((v, i, arr) => arr.indexOf(v) === i)
      .sort()
    return values
  }

  const getActiveFiltersCount = () => {
    return Object.values(localFilters).filter((value) => value && value !== "" && value !== null).length
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros Avançados
            {getActiveFiltersCount() > 0 && <Badge variant="secondary">{getActiveFiltersCount()} filtros ativos</Badge>}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="geral" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="geral">Geral</TabsTrigger>
            <TabsTrigger value="datas">Datas</TabsTrigger>
            <TabsTrigger value="especificos">Específicos</TabsTrigger>
            <TabsTrigger value="quantidades">Quantidades</TabsTrigger>
          </TabsList>

          <TabsContent value="geral" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Informações Pessoais
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome</Label>
                  <Input
                    placeholder="Filtrar por nome..."
                    value={localFilters.nome}
                    onChange={(e) => handleFilterChange("nome", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    placeholder="Filtrar por email..."
                    value={localFilters.email}
                    onChange={(e) => handleFilterChange("email", e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  Tipo e Status
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Tipo de Agendamento</Label>
                  <Select
                    value={localFilters.tipoAgendamento}
                    onValueChange={(value) => handleFilterChange("tipoAgendamento", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os tipos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os tipos</SelectItem>
                      {getUniqueValues("tipoAgendamento").map((tipo) => (
                        <SelectItem key={tipo} value={tipo}>
                          {tipo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={localFilters.status} onValueChange={(value) => handleFilterChange("status", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os status</SelectItem>
                      <SelectItem value="pendente">Pendente</SelectItem>
                      <SelectItem value="confirmado">Confirmado</SelectItem>
                      <SelectItem value="cancelado">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tipo de Serviço</Label>
                  <Select
                    value={localFilters.tipoServico}
                    onValueChange={(value) => handleFilterChange("tipoServico", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os serviços" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os serviços</SelectItem>
                      {getUniqueValues("tipoServico").map((tipo) => (
                        <SelectItem key={tipo} value={tipo}>
                          {tipo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Setor e Centro de Custo
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Time/Setor</Label>
                  <Select
                    value={localFilters.timeSetor}
                    onValueChange={(value) => handleFilterChange("timeSetor", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os setores" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os setores</SelectItem>
                      {getUniqueValues("timeSetor").map((setor) => (
                        <SelectItem key={setor} value={setor}>
                          {setor}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Centro de Custo</Label>
                  <Select
                    value={localFilters.centroCusto}
                    onValueChange={(value) => handleFilterChange("centroCusto", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os centros" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os centros</SelectItem>
                      {getUniqueValues("centroCusto").map((centro) => (
                        <SelectItem key={centro} value={centro}>
                          {centro}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="datas" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Filtros por Data
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Data Início (Agendamento para Time / Home Office)</Label>
                  <DatePicker
                    date={localFilters.dataInicio}
                    onChange={(date) => handleFilterChange("dataInicio", date)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Data Fim (Agendamento para Time / Home Office)</Label>
                  <DatePicker date={localFilters.dataFim} onChange={(date) => handleFilterChange("dataFim", date)} />
                </div>
                <div className="space-y-2">
                  <Label>Data Coffee Break</Label>
                  <DatePicker
                    date={localFilters.dataCoffee}
                    onChange={(date) => handleFilterChange("dataCoffee", date)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Data (Lanche / Visitante)</Label>
                  <DatePicker date={localFilters.data} onChange={(date) => handleFilterChange("data", date)} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="especificos" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Configurações Específicas
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Turno</Label>
                  <Select value={localFilters.turno} onValueChange={(value) => handleFilterChange("turno", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os turnos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os turnos</SelectItem>
                      <SelectItem value="A">A</SelectItem>
                      <SelectItem value="B">B</SelectItem>
                      <SelectItem value="ADM">ADM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Refeitório</Label>
                  <Select
                    value={localFilters.refeitorio}
                    onValueChange={(value) => handleFilterChange("refeitorio", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os refeitórios" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os refeitórios</SelectItem>
                      <SelectItem value="Fazenda">Fazenda</SelectItem>
                      <SelectItem value="Industria">Indústria</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>É Feriado</Label>
                  <Select
                    value={localFilters.isFeriado}
                    onValueChange={(value) => handleFilterChange("isFeriado", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="true">Sim</SelectItem>
                      <SelectItem value="false">Não</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Coffee className="h-4 w-4" />
                  Coffee Break e Refeições
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Cardápio</Label>
                  <Select
                    value={localFilters.cardapio}
                    onValueChange={(value) => handleFilterChange("cardapio", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os cardápios" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os cardápios</SelectItem>
                      {getUniqueValues("cardapio").map((cardapio) => (
                        <SelectItem key={cardapio} value={cardapio}>
                          {cardapio}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Rateio</Label>
                  <Select value={localFilters.rateio} onValueChange={(value) => handleFilterChange("rateio", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="Sim">Sim</SelectItem>
                      <SelectItem value="Não">Não</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Refeições</Label>
                  <Input
                    placeholder="Filtrar por refeição..."
                    value={localFilters.refeicoes}
                    onChange={(e) => handleFilterChange("refeicoes", e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Localização e Pessoas
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Local de Entrega</Label>
                  <Input
                    placeholder="Filtrar por local..."
                    value={localFilters.localEntrega}
                    onChange={(e) => handleFilterChange("localEntrega", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Acompanhante</Label>
                  <Input
                    placeholder="Filtrar por acompanhante..."
                    value={localFilters.acompanhante}
                    onChange={(e) => handleFilterChange("acompanhante", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Nome do Visitante</Label>
                  <Input
                    placeholder="Filtrar por visitante..."
                    value={localFilters.nomeVisitante}
                    onChange={(e) => handleFilterChange("nomeVisitante", e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Rota Extra
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label>Categoria do Dia</Label>
                  <Select value={localFilters.dia} onValueChange={(value) => handleFilterChange("dia", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todas as categorias" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as categorias</SelectItem>
                      <SelectItem value="Feriado">Feriado</SelectItem>
                      <SelectItem value="Sabado">Sábado</SelectItem>
                      <SelectItem value="Domingo">Domingo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="quantidades" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Filtros por Quantidade
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Quantidade Mínima</Label>
                  <Input
                    type="number"
                    placeholder="Ex: 10"
                    value={localFilters.quantidadeMin}
                    onChange={(e) => handleFilterChange("quantidadeMin", e.target.value)}
                  />
                  <p className="text-xs text-gray-500">
                    Considera quantidade de pessoas, visitantes, almoço/lanche, jantar/ceia, etc.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Quantidade Máxima</Label>
                  <Input
                    type="number"
                    placeholder="Ex: 100"
                    value={localFilters.quantidadeMax}
                    onChange={(e) => handleFilterChange("quantidadeMax", e.target.value)}
                  />
                  <p className="text-xs text-gray-500">
                    Considera quantidade de pessoas, visitantes, almoço/lanche, jantar/ceia, etc.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={clearFilters}>
            Limpar Todos os Filtros
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={applyFilters}>Aplicar Filtros</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
