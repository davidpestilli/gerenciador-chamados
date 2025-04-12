export interface Chamado {
  id: string;
  numero: string;
  data_abertura: string;
  ente: string;
  atendente: string;
  funcionalidade: string;
  resumo: string;
  texto_chamado: string;
  texto_resposta: string;
  tags: string[];
  status?: 'Em andamento' | 'Encerrado';
  data_encerramento?: string | null;
  created_at?: string; // ⬅ adicionado
  satisfacao?: string;
}
