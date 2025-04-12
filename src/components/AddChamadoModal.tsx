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
    funcionalidade: '',
    resumo: '',
    texto_chamado: '',
    texto_resposta: '',
    tags: [],
  });

  const [opcoes, setOpcoes] = useState<{ ente: string[]; atendente: string[]; tags: string[]; funcionalidade: string[] }>({
    ente: [],
    atendente: [],
    tags: [],
    funcionalidade: [],
  });

  const fetchListas = async () => {
    const { data } = await supabase.from('listas_personalizadas').select('*');
    if (!data) return;
    const agrupado: { ente: string[]; atendente: string[]; tags: string[]; funcionalidade: string[] } = {
      ente: [],
      atendente: [],
      tags: [],
      funcionalidade: [],
    };
    data.forEach((item: any) => {
      if (['ente', 'atendente', 'tags', 'funcionalidade'].includes(item.campo)) {
        agrupado[item.campo as keyof typeof agrupado].push(item.valor);
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
      <div className="bg-white shadow-2xl rounded-3xl p-10 w-[95vw] overflow-y-auto max-h-[95vh] border border-gray-100">
        <h2 className="text-3xl font-bold mb-8 text-gray-800">Novo Chamado</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          {Object.entries(form).map(([key, value]) => {
            const k = key as keyof typeof form;
            const isLongText = ['resumo', 'texto_chamado', 'texto_resposta'].includes(key);

            const label = key.toUpperCase();

            if (key === 'ente' || key === 'atendente') {
              return (
                <div key={key} className="flex flex-col col-span-1">
                  <label className="text-sm font-bold text-gray-700 mb-2 tracking-widest">{label}</label>
                  <select
                    className="border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-lg"
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

            if (key === 'funcionalidade') {
              return (
                <div key={key} className="flex flex-col col-span-1">
                  <label className="text-sm font-bold text-gray-700 mb-2 tracking-widest">FUNCIONALIDADE</label>
                  <select
                    className="border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-lg"
                    value={form.funcionalidade}
                    onChange={(e) => handleChange('funcionalidade', e.target.value)}
                  >
                    <option value="">Selecione</option>
                    {opcoes.funcionalidade.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              );
            }

            if (key === 'tags') {
              return (
                <div key={key} className="flex flex-col col-span-1">
                  <label className="text-sm font-bold text-gray-700 mb-2 tracking-widest">TAGS</label>
                  <select
                    multiple
                    className="border border-gray-300 p-3 rounded-xl h-40 focus:outline-none focus:ring-2 focus:ring-primary text-lg"
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
              <div key={key} className={`flex flex-col ${isLongText ? 'col-span-full' : 'col-span-1'}`}>
                <label className="text-sm font-bold text-gray-700 mb-2 tracking-widest">{label}</label>
                {isLongText ? (
                  <textarea
                    className="border border-gray-300 p-4 rounded-xl h-64 text-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary"
                    value={value as string}
                    onChange={(e) => handleChange(k, e.target.value)}
                  />
                ) : (
                  <input
                    type={key === 'data_abertura' ? 'date' : 'text'}
                    className="border border-gray-300 p-3 rounded-xl text-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary"
                    value={value as string}
                    onChange={(e) => handleChange(k, e.target.value)}
                  />
                )}
              </div>
            );
          })}
        </div>
        <div className="flex justify-end gap-4">
  <button
    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg shadow-md text-lg transition"
    onClick={handleSubmit}
  >
    Salvar
  </button>
  <button
    className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg shadow-md text-lg transition"
    onClick={onClose}
  >
    Cancelar
  </button>
</div>

      </div>
    </div>
  );
};
