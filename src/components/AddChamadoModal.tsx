import React, { useEffect, useState } from 'react';
import { Chamado } from '../types/Chamado';
import { supabase } from '../services/supabaseClient';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (novo: Omit<Chamado, 'id'>) => Promise<void>;
}

export const AddChamadoModal: React.FC<Props> = ({ isOpen, onClose, onSave }) => {
  const [form, setForm] = useState<Omit<Chamado, 'id'>>({
    numero: '',
    data_abertura: '',
    ente: '',
    atendente: '',
    resumo: '',
    texto_chamado: '',
    texto_resposta: '',
    tags: [],
  });

  const [opcoes, setOpcoes] = useState<{ ente: string[]; atendente: string[]; tags: string[] }>({
    ente: [],
    atendente: [],
    tags: [],
  });

  const [salvando, setSalvando] = useState(false);
  const [_erro, setErro] = useState<string | null>(null);

  const fetchListas = async () => {
    const { data } = await supabase.from('listas_personalizadas').select('*');
    if (!data) return;

    const agrupado: { ente: string[]; atendente: string[]; tags: string[] } = {
      ente: [],
      atendente: [],
      tags: [],
    };

    data.forEach((item: any) => {
      if (['ente', 'atendente', 'tags'].includes(item.campo)) {
        agrupado[item.campo as 'ente' | 'atendente' | 'tags'].push(item.valor);
      }
    });

    setOpcoes(agrupado);
  };

  useEffect(() => {
    if (isOpen) fetchListas();
  }, [isOpen]);

  const handleChange = (field: keyof typeof form, value: string | string[]) => {
    setForm({ ...form, [field]: field === 'tags' ? (value as string[]) : value });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl max-w-2xl w-full">
        <h2 className="text-xl font-semibold mb-4">Novo Chamado</h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          {Object.entries(form).map(([key, value]) => {
            const k = key as keyof typeof form;
            const isLongText = ['resumo', 'texto_chamado', 'texto_resposta'].includes(key);

            if (key === 'ente' || key === 'atendente') {
              return (
                <div key={key} className="flex flex-col col-span-2 sm:col-span-1">
                  <label className="text-sm text-gray-600 mb-1">{key.toUpperCase()}</label>
                  <select
                    className="border border-gray-300 p-2 rounded"
                    value={value as string}
                    onChange={(e) => handleChange(k, e.target.value)}
                  >
                    <option value="">Selecione</option>
                    {opcoes[key as 'ente' | 'atendente'].map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              );
            }

            if (key === 'tags') {
              return (
                <div key={key} className="flex flex-col col-span-2 sm:col-span-1">
                  <label className="text-sm text-gray-600 mb-1">TAGS</label>
                  <select
                    multiple
                    className="border border-gray-300 p-2 rounded h-28"
                    value={form.tags}
                    onChange={(e) => {
                      const selected = Array.from(e.target.selectedOptions).map((o) => o.value);
                      handleChange('tags', selected);
                    }}
                  >
                    {opcoes.tags.map((tag) => (
                      <option key={tag} value={tag}>{tag}</option>
                    ))}
                  </select>
                </div>
              );
            }

            return (
              <div key={key} className="flex flex-col col-span-2 sm:col-span-1">
                <label className="text-sm text-gray-600 mb-1">{key.toUpperCase()}</label>
                {isLongText ? (
                  <textarea
                    className="border border-gray-300 p-2 rounded h-28"
                    value={value as string}
                    onChange={(e) => handleChange(k, e.target.value)}
                  />
                ) : (
                  <input
                    className="border border-gray-300 p-2 rounded"
                    value={value as string}
                    onChange={(e) => handleChange(k, e.target.value)}
                  />
                )}
              </div>
            );
          })}
        </div>
        <div className="flex justify-end gap-2">
          <button
            className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
            disabled={salvando}
            onClick={async () => {
              setSalvando(true);
              setErro(null);
              try {
                await onSave(form);
                onClose();
              } catch (err: any) {
                console.error('Erro ao salvar o chamado:', err);
                setErro(err.message || 'Erro desconhecido');
                alert('Erro ao salvar o chamado: ' + (err.message || 'Erro desconhecido'));
              } finally {
                setSalvando(false);
              }
            }}
          >
            {salvando ? 'Salvando...' : 'Salvar'}
          </button>
          <button className="bg-gray-300 px-4 py-2 rounded" onClick={onClose} disabled={salvando}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};
