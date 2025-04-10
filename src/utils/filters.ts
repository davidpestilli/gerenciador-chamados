import { Chamado } from '../types/Chamado';

interface Filtros {
  numero?: string;
  atendente?: string;
  ente?: string;
  data?: string;
  tags?: string;
}

export function filtrarChamados(chamados: Chamado[], filtros: Filtros): Chamado[] {
  return chamados.filter((chamado: Chamado) => {
    return (
      (!filtros.numero || chamado.numero.toLowerCase().includes(filtros.numero.toLowerCase())) &&
      (!filtros.atendente || chamado.atendente.toLowerCase().includes(filtros.atendente.toLowerCase())) &&
      (!filtros.ente || chamado.ente.toLowerCase().includes(filtros.ente.toLowerCase())) &&
      (!filtros.data || chamado.data_abertura === filtros.data) &&
      (!filtros.tags || chamado.tags?.join(',').toLowerCase().includes(filtros.tags.toLowerCase()))
    );
  });
}
