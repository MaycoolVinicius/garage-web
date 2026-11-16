export type TipoItem = 'PECA' | 'SERVICO';

export interface TokenResponse {
  token: string;
  expiraEm: string;
}

export interface ItemRequest {
  tipo: TipoItem;
  descricao: string;
  quantidade: number;
  valorUnitario: number;
}

export interface OrdemServicoRequest {
  nomeCliente: string;
  telefone: string;
  placa: string;
  modelo: string | null;
  km: number | null;
  observacoes: string | null;
  itens: ItemRequest[];
}

export interface ItemResponse extends ItemRequest {
  subtotal: number;
}

export interface OrdemServicoResponse {
  id: number;
  nomeCliente: string;
  telefone: string;
  placa: string;
  modelo: string | null;
  km: number | null;
  observacoes: string | null;
  dataAbertura: string;
  itens: ItemResponse[];
  valorTotal: number;
}

export interface OrdemServicoResumo {
  id: number;
  nomeCliente: string;
  placa: string;
  dataAbertura: string;
  valorTotal: number;
}
