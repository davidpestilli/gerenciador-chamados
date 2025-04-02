// src/components/Table.tsx
import React, { useEffect, useState } from 'react';
import { Chamado } from '../types/Chamado';
import { supabase } from '../services/supabaseClient';
import { Modal } from './Modal';
import { EditableModal } from './EditableModal';
import { AddChamadoModal } from './AddChamadoModal';
import { filtrarChamados } from '../utils/filters';

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

  const [filtroAtendente, setFiltroAtendente] = useState('');
  const [filtroEnte, setFiltroEnte] = useState('');
  const [filtroData, setFiltroData] = useState('');
  const [filtroTags, setFiltroTags] = useState('');

  const [paginaAtual, setPaginaAtual] = useState(1);
  const [porPagina, setPorPagina] = useState(10);

  const [ordemColuna, setOrdemColuna] = useState<keyof Chamado | null>(null);
  const [ordemAscendente, setOrdemAscendente] = useState(true);

  const [selecionados, setSelecionados] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchChamados = async () => {
      const { data } = await supabase.from('chamados').select('*');
      if (data) setChamados(data);
    };
    fetchChamados();
  }, []);

  const handleAddChamado = async (novo: Omit<Chamado, 'id'>) => {
    const { data, error } = await supabase.from('chamados').insert(novo).select();
    if (data && data[0]) {
      setChamados(prev => [...prev, data[0]]);
      setShowAddModal(false);
    } else {
      alert('Erro ao salvar o chamado');
    }
  };

  const openModal = (chamado: Chamado, key: keyof Chamado) => {
    setSelectedChamado(chamado);
    setField(key);
  };

  const saveField = async (value: string) => {
    if (!selectedChamado || !field) return;
    const updated = { ...selectedChamado, [field]: field === 'tags' ? value.split(',').map(t => t.trim()) : value };
    await supabase.from('chamados').update({ [field]: updated[field] }).eq('id', selectedChamado.id);
    setChamados((prev) => prev.map(c => c.id === updated.id ? updated : c));
    setIsEditing(false);
    setSelectedChamado(updated);
  };

  const excluirChamado = async (id: string) => {
    const confirmar = confirm('Tem certeza que deseja excluir este chamado?');
    if (!confirmar) return;
    await supabase.from('chamados').delete().eq('id', id);
    setChamados(prev => prev.filter(c => c.id !== id));
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

  const headers: (keyof Chamado)[] = ['numero', 'data_abertura', 'ente', 'atendente', 'resumo', 'texto_chamado', 'texto_resposta', 'tags'];

  const chamadosFiltrados = filtrarChamados(chamados, {
    atendente: filtroAtendente,
    ente: filtroEnte,
    data: filtroData,
    tags: filtroTags,
  });

  const chamadosOrdenados = ordemColuna
    ? [...chamadosFiltrados].sort((a, b) => {
        const valorA = a[ordemColuna] || '';
        const valorB = b[ordemColuna] || '';
        return ordemAscendente
          ? String(valorA).localeCompare(String(valorB))
          : String(valorB).localeCompare(String(valorA));
      })
    : chamadosFiltrados;

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

  return (
    <div className="overflow-x-auto">
      <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
        <div className="flex gap-2 flex-wrap">
          <input type="date" className="border px-2 py-1 rounded" value={filtroData} onChange={(e) => setFiltroData(e.target.value)} placeholder="Data de Abertura" />
          <input type="text" className="border px-2 py-1 rounded" value={filtroAtendente} onChange={(e) => setFiltroAtendente(e.target.value)} placeholder="Atendente" />
          <input type="text" className="border px-2 py-1 rounded" value={filtroEnte} onChange={(e) => setFiltroEnte(e.target.value)} placeholder="Ente" />
          <input type="text" className="border px-2 py-1 rounded" value={filtroTags} onChange={(e) => setFiltroTags(e.target.value)} placeholder="Tags" />
          <select value={porPagina} onChange={(e) => { setPorPagina(Number(e.target.value)); setPaginaAtual(1); }} className="border px-2 py-1 rounded">
            {[5, 10, 15, 20].map(n => (<option key={n} value={n}>{n} por página</option>))}
          </select>
        </div>
        <div className="flex gap-2">
          {selecionados.size > 0 && (
            <button className="bg-red-600 text-white px-4 py-2 rounded" onClick={excluirSelecionados}>Excluir Selecionados</button>
          )}
          <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={() => setShowAddModal(true)}>
            Adicionar Chamado
          </button>
        </div>
      </div>

      <table className="table-auto w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border text-center"></th>
            {headers.map((key) => (
              <th key={key} className="p-2 border text-center cursor-pointer hover:bg-gray-200" onClick={() => toggleOrdem(key)}>
                {key.replace('_', ' ').toUpperCase()}{ordemColuna === key ? (ordemAscendente ? ' ▲' : ' ▼') : ''}
              </th>
            ))}
            <th className="p-2 border text-center"></th>
          </tr>
        </thead>
        <tbody>
          {chamadosPaginados.map((chamado, index) => (
            <tr
              key={chamado.id}
              className={
                (index % 2 === 0 ? 'bg-white' : 'bg-gray-50') + ' hover:bg-red-50 group'
              }
            >
              <td className="p-2 border text-center">
                <input type="checkbox" checked={selecionados.has(chamado.id)} onChange={() => toggleSelecionado(chamado.id)} />
              </td>
              {headers.map((key) => (
                <td
                  key={key}
                  className="p-2 border cursor-pointer text-center"
                  onClick={() => openModal(chamado, key)}
                >
                {Array.isArray(chamado[key])
                ? (chamado[key] as string[]).join(', ')
                : key === 'data_abertura' && chamado[key]
                    ? formatarData(chamado[key] as string)
                    : chamado[key] || '(vazio)'}
                </td>
              ))}
              <td className="p-2 border text-center">
                <button
                  className="text-red-500 font-bold opacity-0 group-hover:opacity-100"
                  onClick={() => excluirChamado(chamado.id)}
                  title="Excluir"
                >
                  🗑️
                </button>
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

      {selectedChamado && field && !isEditing && (
        <Modal
          isOpen={true}
          title={field.toUpperCase()}
          content={Array.isArray(selectedChamado[field]) ? selectedChamado[field].join(', ') : selectedChamado[field] || ''}
          onClose={() => setSelectedChamado(null)}
          onEdit={() => setIsEditing(true)}
        />
      )}

      {selectedChamado && field && isEditing && (
        <EditableModal
          isOpen={true}
          title={`Editar ${field.toUpperCase()}`}
          initialValue={String(selectedChamado[field] || '')}
          onClose={() => setIsEditing(false)}
          onSave={saveField}
        />
      )}

      <AddChamadoModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAddChamado}
      />
    </div>
  );
};
