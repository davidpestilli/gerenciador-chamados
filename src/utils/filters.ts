export function filtrarChamados(
  chamados: any[],
  {
    numero,
    atendente,
    ente,
    data,
    tags,
    funcionalidade,
  }: {
    numero?: string;
    atendente?: string;
    ente?: string;
    data?: string;
    tags?: string;
    funcionalidade?: string;
  }
) {
  return chamados.filter((chamado) => {
    const matchNumero = !numero || chamado.numero?.toLowerCase().includes(numero.toLowerCase());
    const matchAtendente = !atendente || chamado.atendente?.toLowerCase().includes(atendente.toLowerCase());
    const matchEnte = !ente || chamado.ente?.toLowerCase().includes(ente.toLowerCase());
    const matchData = !data || chamado.data_abertura?.startsWith(data);
    const matchTags =
      !tags ||
      (Array.isArray(chamado.tags)
      ? chamado.tags.some((tag: string) => tag.toLowerCase().includes(tags.toLowerCase()))
        : chamado.tags?.toLowerCase().includes(tags.toLowerCase()));
    const matchFuncionalidade =
      !funcionalidade || chamado.funcionalidade?.toLowerCase().includes(funcionalidade.toLowerCase());

    return matchNumero && matchAtendente && matchEnte && matchData && matchTags && matchFuncionalidade;
  });
}

