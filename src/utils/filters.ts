import { Chamado } from '../types/Chamado';

interface Filtros {
  atendente: string;
  ente: string;
  data: string;
  tags: string;
}

export function filtrarChamados(chamados: Chamado[], filtros: Filtros): Chamado[] {
  return chamados.filter((c) => {
    return (
      (!filtros.atendente || c.atendente.toLowerCase().includes(filtros.atendente.toLowerCase())) &&
      (!filtros.ente || c.ente.toLowerCase().includes(filtros.ente.toLowerCase())) &&
      (!filtros.data || c.data_abertura === filtros.data) &&
      (!filtros.tags || (c.tags || []).some(tag => tag.toLowerCase().includes(filtros.tags.toLowerCase())))
    );
  });
}
