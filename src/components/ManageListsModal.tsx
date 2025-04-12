// src/components/ManageListsModal.tsx
import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const ManageListsModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const campos = ['ente', 'atendente', 'tags', 'funcionalidade'] as const;
  type Campo = typeof campos[number];

  const [novos, setNovos] = useState<Record<Campo, string>>({
    ente: '',
    atendente: '',
    tags: '',
    funcionalidade: '',
  });

  const [listas, setListas] = useState<Record<Campo, { id: string; valor: string }[]>>({
    ente: [],
    atendente: [],
    tags: [],
    funcionalidade: [],
  });

  const fetchListas = async () => {
    const { data } = await supabase.from('listas_personalizadas').select('*');
    if (!data) return;
    const agrupado: Record<Campo, { id: string; valor: string }[]> = {
      ente: [],
      atendente: [],
      tags: [],
      funcionalidade: [],
    };
    data.forEach((item: any) => {
      if (campos.includes(item.campo)) {
        agrupado[item.campo as Campo].push({ id: item.id, valor: item.valor });
      }
    });
    setListas(agrupado);
  };

  const salvar = async () => {
    const inserts = campos
      .filter((campo) => novos[campo].trim())
      .map((campo) => ({ campo, valor: novos[campo].trim() }));

    if (inserts.length > 0) {
      await supabase.from('listas_personalizadas').insert(inserts);
      setNovos({ ente: '', atendente: '', tags: '', funcionalidade: '' });
      fetchListas();
    }
  };

  const remover = async (id: string) => {
    const confirmar = confirm('Deseja realmente remover este item?');
    if (!confirmar) return;
    await supabase.from('listas_personalizadas').delete().eq('id', id);
    fetchListas();
  };

  useEffect(() => {
    if (isOpen) fetchListas();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-10 rounded-3xl w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Gerenciar Listas</h2>
        <div className="flex flex-col gap-6">
          {campos.map((campo) => (
            <div key={campo}>
              <label className="block text-sm font-bold mb-2 uppercase tracking-widest text-gray-700">{campo}</label>
              <input
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-primary"
                value={novos[campo]}
                onChange={(e) => setNovos({ ...novos, [campo]: e.target.value })}
              />
              <div className="text-sm text-gray-600 flex flex-wrap gap-2 mt-2">
                {listas[campo].length > 0 ? (
                  listas[campo].map((item) => (
                    <span
                      key={item.id}
                      className="bg-gray-100 border border-gray-300 rounded-xl px-3 py-1 text-sm flex items-center gap-2"
                    >
                      {item.valor}
                      <button
                        className="text-red-500 hover:text-red-700 text-lg"
                        onClick={() => remover(item.id)}
                        title="Remover"
                      >×</button>
                    </span>
                  ))
                ) : (
                  <em className="text-gray-400">(nenhum salvo)</em>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-3 mt-8">
          <button className="bg-indigo-600 text-white px-6 py-3 rounded-xl shadow hover:bg-indigo-700 transition" onClick={salvar}>Salvar</button>
          <button className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-xl" onClick={onClose}>Fechar</button>
        </div>
      </div>
    </div>
  );
};
