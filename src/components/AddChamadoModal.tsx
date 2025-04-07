// src/components/AddChamadoModal.tsx
import React, { useEffect, useState } from 'react';
import { Chamado } from '../types/Chamado';
import { supabase } from '../services/supabaseClient';
import { toast } from 'sonner';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (novo: Omit<Chamado, 'id'>) => void;
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

  const handleSubmit = () => {
    if (!form.numero || !form.data_abertura) {
      toast.error('Preencha os campos obrigatórios: número e data.');
      return;
    }
    onSave(form);
    toast.success('Chamado adicionado com sucesso!');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40">
      <div className="bg-white shadow-xl rounded-2xl p-6 w-full max-w-3xl overflow-y-auto max-h-[90vh]">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">Novo Chamado</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {Object.entries(form).map(([key, value]) => {
            const k = key as keyof typeof form;
            const isLongText = ['resumo', 'texto_chamado', 'texto_resposta'].includes(key);

            if (key === 'ente' || key === 'atendente') {
              return (
                <div key={key} className="flex flex-col">
                  <label className="text-sm text-gray-600 mb-1 font-medium">{key.toUpperCase()}</label>
                  <select
                    className="border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
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
                <div key={key} className="flex flex-col">
                  <label className="text-sm text-gray-600 mb-1 font-medium">TAGS</label>
                  <select
                    multiple
                    className="border border-gray-300 p-2 rounded-lg h-32 focus:outline-none focus:ring-2 focus:ring-blue-400"
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
              <div key={key} className="flex flex-col">
                <label className="text-sm text-gray-600 mb-1 font-medium">{key.toUpperCase()}</label>
                {isLongText ? (
                  <textarea
                    className="border border-gray-300 p-2 rounded-lg h-28 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    value={value as string}
                    onChange={(e) => handleChange(k, e.target.value)}
                  />
                ) : (
                  <input
                    className="border border-gray-300 p-2 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
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
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow-sm transition"
            onClick={handleSubmit}
          >
            Salvar
          </button>
          <button
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg shadow-sm transition"
            onClick={onClose}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};
