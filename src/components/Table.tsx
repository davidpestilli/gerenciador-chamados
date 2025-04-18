// src/components/Table.tsx
import React, { useEffect, useState } from 'react';
import { Chamado } from '../types/Chamado';
import { supabase } from '../services/supabaseClient';
import { Modal } from './Modal';
import { EditableModal } from './EditableModal';
import { AddChamadoModal } from './AddChamadoModal';
import { filtrarChamados } from '../utils/filters';
import { ManageListsModal } from './ManageListsModal';
import { EstatisticasModal } from './EstatisticasModal';
import { toast } from 'sonner';
import { SatisfacaoModal } from './SatisfacaoModal';
import { ScriptsModal } from './ScriptsModal';
import { GeradorModal } from './GeradorModal';
import { ScriptModal } from './ScriptModal';

const emojiMap: Record<string, string> = {
  muito_satisfeito: '😁',
  satisfeito: '🙂',
  neutro: '😐',
  insatisfeito: '🙁',
  muito_insatisfeito: '😠',
};


const formatarData = (iso: string) => {
  const [ano, mes, dia] = iso.split('-');
  return `${dia}/${mes}/${ano}`;
};

export const Table: React.FC = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [chamados, setChamados] = useState<Chamado[]>([]);
  const [selectedChamado, setSelectedChamado] = useState<Chamado | null>(null);
  const [field, setField] = useState<keyof Chamado | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showScriptsModal, setShowScriptsModal] = useState(false);

  const [showGeradorModal, setShowGeradorModal] = useState(false);
  const [textoFinal, setTextoFinal] = useState('');
  const [showScriptModal, setShowScriptModal] = useState(false);

  const [filtroAtendente, setFiltroAtendente] = useState('');
  const [filtroEnte, setFiltroEnte] = useState('');
  const [filtroData, setFiltroData] = useState('');
  const [filtroTags, setFiltroTags] = useState('');
  const [filtroNumero, setFiltroNumero] = useState('');
  const [filtroFuncionalidade, setFiltroFuncionalidade] = useState('');


  const [paginaAtual, setPaginaAtual] = useState(1);
  const [porPagina, setPorPagina] = useState(10);

  const [ordemColuna, setOrdemColuna] = useState<keyof Chamado | null>(null);
  const [ordemAscendente, setOrdemAscendente] = useState(true);

  const [selecionados, setSelecionados] = useState<Set<string>>(new Set());
  const [showManageLists, setShowManageLists] = useState(false);

  const [editingCell, setEditingCell] = useState<{ id: string; key: keyof Chamado } | null>(null);
  const [editingValue, setEditingValue] = useState('');

  const [showEstatisticasModal, setShowEstatisticasModal] = useState(false);

  const [showSatisfacaoModal, setShowSatisfacaoModal] = useState(false);

  type CorFiltro = 'todos' | 'amarelo' | 'vermelho' | 'verde';

  const [filtroStatusVisual, setFiltroStatusVisual] = useState<CorFiltro>('todos');

  useEffect(() => {
    const fetchChamados = async () => {
      const { data } = await supabase.from('chamados').select('*');
      if (data) setChamados(data);
    };
    fetchChamados();
  }, []);

  const handleAddChamado = async (novo: Omit<Chamado, 'id'>) => {
    const { data, error } = await supabase.from('chamados').insert(novo).select();
    if (error) {
      alert('Erro ao salvar o chamado: ' + error.message);
      return;
    }
    if (data && data[0]) {
      setChamados(prev => [...prev, data[0]]);
      setShowAddModal(false);
    }
  };
  

  const saveInline = async (id: string, key: keyof Chamado, value: any) => {
    await supabase.from('chamados').update({ [key]: value }).eq('id', id);
    setChamados(prev => prev.map(c => (c.id === id ? { ...c, [key]: value } : c)));
    setEditingCell(null);
  };

  const startEditing = (id: string, key: keyof Chamado, value: any) => {
    setEditingCell({ id, key });
    setEditingValue(value);
  };



  const excluirSelecionados = async () => {
    const confirmar = confirm('Tem certeza que deseja excluir os chamados selecionados?');
    if (!confirmar) return;
    await supabase.from('chamados').delete().in('id', Array.from(selecionados));
    setChamados(prev => prev.filter(c => !selecionados.has(c.id)));
    setSelecionados(new Set());
  };

  const toggleSelecionado = (id: string) => {
    setSelecionados(prev => {
      const novo = new Set(prev);
      if (novo.has(id)) {
        novo.delete(id);
      } else {
        novo.add(id);
      }
      return novo;
    });
  };

  const headers: (keyof Chamado)[] = ['numero', 'data_abertura', 'ente', 'atendente', 'funcionalidade', 'resumo', 'texto_chamado', 'texto_resposta', 'tags'];

  const chamadosFiltrados = filtrarChamados(chamados, {
    numero: filtroNumero,
    atendente: filtroAtendente,
    ente: filtroEnte,
    data: filtroData,
    tags: filtroTags,
    funcionalidade: filtroFuncionalidade,
  });
  
  

  const chamadosFiltradosComStatus = chamadosFiltrados.filter((chamado: Chamado) => {
    const referencia = chamado.created_at ?? chamado.data_abertura;
    const dias = Math.floor((Date.now() - new Date(referencia).getTime()) / (1000 * 60 * 60 * 24));
  
    if (filtroStatusVisual === 'verde') return chamado.status === 'Encerrado';
    if (filtroStatusVisual === 'amarelo') return chamado.status !== 'Encerrado' && dias <= 5;
    if (filtroStatusVisual === 'vermelho') return chamado.status !== 'Encerrado' && dias > 5;    
    return true; // "todos"
  });
  
  

  const chamadosOrdenados = ordemColuna
  ? [...chamadosFiltradosComStatus].sort((a, b) => {
      const valorA = a[ordemColuna] || '';
      const valorB = b[ordemColuna] || '';
      return ordemAscendente
        ? String(valorA).localeCompare(String(valorB))
        : String(valorB).localeCompare(String(valorA));
    })
  : chamadosFiltradosComStatus;


  const totalPaginas = Math.ceil(chamadosOrdenados.length / porPagina);
  const chamadosPaginados = chamadosOrdenados.slice((paginaAtual - 1) * porPagina, paginaAtual * porPagina);

  const toggleOrdem = (coluna: keyof Chamado) => {
    if (ordemColuna === coluna) {
      setOrdemAscendente(!ordemAscendente);
    } else {
      setOrdemColuna(coluna);
      setOrdemAscendente(true);
    }
  };

  const alternarStatusChamado = async (chamado: Chamado) => {
    const novoStatus = chamado.status === 'Encerrado' ? 'Em andamento' : 'Encerrado';
    const novaDataEncerramento = novoStatus === 'Encerrado' ? new Date().toISOString().split('T')[0] : null;
  
    const { error } = await supabase
      .from('chamados')
      .update({ status: novoStatus, data_encerramento: novaDataEncerramento })
      .eq('id', chamado.id);
  
    if (!error) {
      setChamados((prev) =>
        prev.map((c) => c.id === chamado.id ? { ...c, status: novoStatus, data_encerramento: novaDataEncerramento } : c)
      );
    } else {
      alert('Erro ao atualizar status do chamado.');
    }
  };
  
  const [selectedScript, setSelectedScript] = useState<{ nome: string; conteudo_bruto: string } | null>(null);
  
  return (
    <div className="overflow-x-auto">
      <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
        <div className="flex gap-2 flex-wrap">
          <input type="date" className="border px-2 py-1 rounded" value={filtroData} onChange={(e) => setFiltroData(e.target.value)} placeholder="Data de Abertura" />
          <input type="text" className="border px-2 py-1 rounded" value={filtroAtendente} onChange={(e) => setFiltroAtendente(e.target.value)} placeholder="Atendente" />
          <input type="text" className="border px-2 py-1 rounded" value={filtroEnte} onChange={(e) => setFiltroEnte(e.target.value)} placeholder="Ente" />
          <input type="text" className="border px-2 py-1 rounded" value={filtroTags} onChange={(e) => setFiltroTags(e.target.value)} placeholder="Tags" />
          <input type="text" className="border px-2 py-1 rounded" value={filtroNumero} onChange={(e) => setFiltroNumero(e.target.value)} placeholder="Número do processo" />
          <input type="text" className="border px-2 py-1 rounded" value={filtroFuncionalidade} onChange={(e) => setFiltroFuncionalidade(e.target.value)}placeholder="Funcionalidade"
/>


<select
  className="border px-2 py-1 rounded"
  value={filtroStatusVisual}
  onChange={(e) => setFiltroStatusVisual(e.target.value as any)}
>
  <option value="todos">🧾 Todos</option>
  <option value="amarelo">🟡 Amarelos (em andamento, até 5 dias)</option>
<option value="vermelho">🔴 Vermelhos (em andamento, 6+ dias)</option>
  <option value="verde">🟢 Verdes (encerrados)</option>
</select>



          <select value={porPagina} onChange={(e) => { setPorPagina(Number(e.target.value)); setPaginaAtual(1); }} className="border px-2 py-1 rounded">
            {[5, 10, 15, 20].map(n => (<option key={n} value={n}>{n} por página</option>))}
          </select>
        </div>
        <div className="flex justify-between items-center mb-4 flex-wrap">
        {selecionados.size > 0 && (
            <button className="bg-red-600 text-white px-4 py-2 rounded" onClick={excluirSelecionados}>Excluir Selecionados</button>
          )}
  <div className="flex items-center gap-10">
    {/* Ícones de GPTs */}
    <div className="flex gap-4 ml-8">
      <a href="https://chatgpt.com/g/g-67e6b69df59081918c0b955b75fb8218-eproc-tribunais" title="eproc Tribunais - Guia eproc com conteúdo geral, de vários tribunais, voltado para público interno e externo." target="_blank" rel="noopener noreferrer">
        <span className="text-4xl hover:scale-110 hover:text-blue-500 transition-all cursor-pointer" role="button" aria-label="eproc Tribunais">🤖</span>
      </a>
      <a href="https://chatgpt.com/g/g-67e6b729db588191bb4ed1300f0dac66-eproc-sao-paulo-interno" title="eproc São Paulo - Interno - Guia eProc para utilização no sistema do Tribunal de Justiça de São Paulo sem conteúdo voltado para o público externo (Advogados, entes conveniados, etc)." target="_blank" rel="noopener noreferrer">
        <span className="text-4xl hover:scale-110 hover:text-yellow-500 transition-all cursor-pointer" role="button" aria-label="eproc São Paulo - Interno">🤖</span>
      </a>
      <a href="https://chatgpt.com/g/g-67e6f6966b448191abd182dbfaac69bd-eproc-sao-paulo-externos" title="eproc São Paulo - Externo - Traz informações sobre como externos (MP, DEF, Polícia, Advogados, Cidadãos etc) utilizam o eproc, conforme cursos do TJSP. Não há material voltado ao público interno." target="_blank" rel="noopener noreferrer">
        <span className="text-4xl hover:scale-110 hover:text-indigo-500 transition-all cursor-pointer" role="button" aria-label="eproc São Paulo - Externo">🤖</span>
      </a>
      <a href="https://chatgpt.com/g/g-67f3f414b738819183b922f011ed18fd-eproc-santa-catarina-interno" title="eproc Santa Catarina - Completo - Guia eproc produzido com conteúdo do Tribunal de Justiça de Santa Catarina. Conteúdo bastante diversificado, pode ter soluções que não estão no TJSP. Nem sempre as soluções funcionam no TJSP mas podem trazer ideias." target="_blank" rel="noopener noreferrer">
        <span className="text-4xl hover:scale-110 hover:text-green-500 transition-all cursor-pointer" role="button" aria-label="eproc Santa Catarina - Completo">🤖</span>
      </a>
      <a href="https://chatgpt.com/g/g-67f3f5bf9364819194159ecc8430c961-eproc-telas-comentadas-completo" title="eproc Telas Comentadas - Completo - Guia eproc produzido com conteúdo do canal Telas Comentadas do Eproc, mantido pelo colega Nazário, funcionário do TRF2" target="_blank" rel="noopener noreferrer">
        <span className="text-4xl hover:scale-110 hover:text-pink-500 transition-all cursor-pointer" role="button" aria-label="eproc Telas Comentadas - Completo">🤖</span>
      </a>
    </div>

    {/* Botões */}
    <div className="flex gap-2">
      <button className="bg-green-600 text-white px-4 py-2 rounded" onClick={() => setShowEstatisticasModal(true)}>
        Estatísticas
      </button>
      <button className="bg-purple-600 text-white px-4 py-2 rounded" onClick={() => setShowManageLists(true)}>
        Gerenciar Lists
      </button>
      <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={() => setShowAddModal(true)}>
        Adicionar Chamado
      </button>
      <button className="bg-orange-500 text-white px-4 py-2 rounded" onClick={() => setShowScriptsModal(true)}>
                Scripts
              </button>
    </div>
  </div>
</div>
</div>

      <table className="table-auto w-full border">
        <thead>
          <tr className="bg-gray-100">

          <th className="p-2 border text-center">
          <span role="img" aria-label="Excluir">🗑️</span>
        </th>

          <th className="p-2 border text-center max-w-[6ch] truncate overflow-hidden whitespace-nowrap">SEQ</th>

            {headers.map((key) => (
              <th key={key} className={`p-2 border text-center cursor-pointer hover:bg-gray-200 ${['numero', 'data_abertura', 'ente', 'atendente', 'tags', 'resumo', 'texto_chamado', 'texto_resposta', 'funcionalidade'].includes(key) ? 'max-w-[10ch] truncate overflow-hidden whitespace-nowrap' : ''}`} onClick={() => toggleOrdem(key)}>

                {key.replace('_', ' ').toUpperCase()}{ordemColuna === key ? (ordemAscendente ? ' ▲' : ' ▼') : ''}
              </th>
            ))}
            <th className="p-2 border text-center w-10">
            ⏱️
            </th>
            <th className="p-2 border text-center" title="Satisfação">
            ❤️
            </th>

          </tr>
        </thead>
        <tbody>
        {chamadosPaginados.map((chamado: Chamado, index: number) => (
            <tr
              key={chamado.id}
              className={(index % 2 === 0 ? 'bg-white' : 'bg-gray-50') + ' hover:bg-red-50 group'}
            >
              <td className="p-2 border text-center">
                <input type="checkbox" checked={selecionados.has(chamado.id)} onChange={() => toggleSelecionado(chamado.id)} />
              </td>
              <td className="p-2 border text-center font-semibold max-w-[6ch] truncate overflow-hidden whitespace-nowrap">{(paginaAtual - 1) * porPagina + index + 1}</td>

              {headers.map((key) => {
                const isEditableInline = ['data_abertura', 'ente', 'atendente', 'funcionalidade'].includes(key);
                const isEditingThisCell = editingCell?.id === chamado.id && editingCell?.key === key;
                const conteudo = Array.isArray(chamado[key])
                  ? (chamado[key] as string[]).join(', ')
                  : key === 'data_abertura' && chamado[key]
                  ? formatarData(chamado[key] as string)
                  : chamado[key] || '(vazio)';

                return (
                  <td key={key} className={`p-2 border text-center ${['numero', 'data_abertura', 'ente', 'atendente', 'tags', 'resumo', 'texto_chamado', 'texto_resposta', 'funcionalidade'].includes(key) ? 'max-w-[10ch] truncate overflow-hidden whitespace-nowrap' : ''}`}>

                    {isEditableInline && isEditingThisCell ? (
                      <input
                        type={key === 'data_abertura' ? 'date' : 'text'}
                        value={editingValue}
                        onChange={(e) => setEditingValue(e.target.value)}
                        onBlur={() => saveInline(chamado.id, key, editingValue)}
                        onKeyDown={(e) => e.key === 'Enter' && saveInline(chamado.id, key, editingValue)}
                        autoFocus
                      />
                    ) : (
<div
  className="cursor-pointer overflow-hidden whitespace-nowrap text-ellipsis w-full"
  title={conteudo}
  onClick={() => {
    if (key === 'numero') {
      navigator.clipboard.writeText(conteudo);
      toast.success('Número copiado!');
    } else if (isEditableInline) {
      startEditing(chamado.id, key, chamado[key]);
    } else if (key !== 'satisfacao') {
      setSelectedChamado(chamado);
      setField(key);
    }
  }}
  
>
  {conteudo}
</div>

                    )}
                  </td>
                );
              })}

<td className="p-2 border text-center">
  {(() => {
    const referencia = chamado.created_at ?? chamado.data_abertura;
    const diasPassados = Math.floor(
      (Date.now() - new Date(referencia).getTime()) / (1000 * 60 * 60 * 24)
    );
    const percentualRestante = Math.max(0, 100 - (diasPassados / 5) * 100);

    const style = chamado.status === 'Encerrado'
      ? {
          backgroundColor: '#39FF14',
          boxShadow: '0 0 6px 2px #39FF14',
        }
      : {
          background: `conic-gradient(#FFD700 0% ${percentualRestante}%, #FF4C4C ${percentualRestante}% 100%)`,
          boxShadow: `0 0 6px 2px ${diasPassados >= 5 ? '#FF4C4C' : '#FFD700'}`,
        };

    const title = chamado.status === 'Encerrado'
      ? 'Clique para reabrir chamado'
      : `Dias desde envio ao cliente: ${diasPassados} / 5`;

    return (
      <button
        onClick={() => alternarStatusChamado(chamado)}
        title={title}
        className="w-4 h-4 rounded-full mx-auto transition-transform transform hover:scale-125"
        style={style}
      />
    );
  })()}
</td>

<td className="p-2 border text-center cursor-pointer text-xl" onClick={() => {
  setSelectedChamado(chamado);
  setShowSatisfacaoModal(true);
}}>
  {emojiMap[chamado.satisfacao ?? ''] || '⬜'}
</td>

            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-between items-center mt-4">
        <span className="text-sm text-gray-600">
          Página {paginaAtual} de {totalPaginas}
        </span>
        <div className="flex gap-2">
          <button className="px-3 py-1 border rounded disabled:opacity-50" onClick={() => setPaginaAtual(p => Math.max(p - 1, 1))} disabled={paginaAtual === 1}>Anterior</button>
          <button className="px-3 py-1 border rounded disabled:opacity-50" onClick={() => setPaginaAtual(p => Math.min(p + 1, totalPaginas))} disabled={paginaAtual === totalPaginas}>Próxima</button>
        </div>
      </div>

      <AddChamadoModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAddChamado}
      />

      <ManageListsModal
        isOpen={showManageLists}
        onClose={() => setShowManageLists(false)}
      />

      <EstatisticasModal
        isOpen={showEstatisticasModal}
        onClose={() => setShowEstatisticasModal(false)}
      />

      {selectedChamado && field && !isEditing && (
        <Modal
          isOpen={true}
          title={field.toUpperCase()}
          content={Array.isArray(selectedChamado[field]) ? selectedChamado[field].join(', ') : selectedChamado[field] || ''}
          onClose={() => setSelectedChamado(null)}
          onEdit={() => setIsEditing(true)}
        />
      )}

{selectedChamado && showSatisfacaoModal && (
  <SatisfacaoModal
    isOpen={true}
    chamadoId={selectedChamado.id}
    valorAtual={selectedChamado.satisfacao || ''}
    onClose={() => setShowSatisfacaoModal(false)}
    onSave={(novoValor) => {
      setChamados((prev) =>
        prev.map((c) => c.id === selectedChamado.id ? { ...c, satisfacao: novoValor } : c)
      );
    }}
    />
  )}

<ScriptsModal
        isOpen={showScriptsModal}
        onClose={() => setShowScriptsModal(false)}
        onOpenGerador={(script) => {
          setSelectedScript(script);
          setShowGeradorModal(true);
        }}
        />

{selectedScript && showGeradorModal && (
        <GeradorModal
          isOpen={true}
          onClose={() => setShowGeradorModal(false)}
          script={selectedScript}
          onGerar={(texto) => {
            setTextoFinal(texto);
            setShowGeradorModal(false);
            setShowScriptModal(true);
          }}
        />
      )}

{showScriptModal && (
        <ScriptModal
          isOpen={true}
          texto={textoFinal}
          onClose={() => setShowScriptModal(false)}
        />
      )}

{selectedChamado && field && isEditing && field !== 'satisfacao' && (
        <EditableModal
          isOpen={true}
          title={`Editar ${field.toUpperCase()}`}
          initialValue={String(selectedChamado[field] || '')}
          onClose={() => setIsEditing(false)}
          onSave={async (value: string) => {
            if (!selectedChamado || !field) return;
            const updated = {
              ...selectedChamado,
              [field]: field === 'tags' ? value.split(',').map(t => t.trim()) : value,
            };
            await supabase
              .from('chamados')
              .update({ [field]: updated[field] })
              .eq('id', selectedChamado.id);
            setChamados((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
            setIsEditing(false);
            setSelectedChamado(updated);
          }}
        />
      )}
    </div>
  );
};
