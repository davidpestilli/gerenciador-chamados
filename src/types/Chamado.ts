// src/types/Chamado.ts
export interface Chamado {
    id: string;
    numero: string;
    data_abertura: string;
    ente: string;
    atendente: string;
    resumo: string;
    texto_chamado: string;
    texto_resposta: string;
    tags: string[];
    status?: 'Em andamento' | 'Encerrado';
    data_encerramento?: string | null;
  }