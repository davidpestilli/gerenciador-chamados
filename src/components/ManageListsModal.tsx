import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const ManageListsModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const campos = ['ente', 'atendente', 'tags'] as const;
  type Campo = typeof campos[number];

  const [novos, setNovos] = useState<Record<Campo, string>>({
    ente: '',
    atendente: '',
    tags: '',
  });

  const [listas, setListas] = useState<Record<Campo, { id: string; valor: string }[]>>({
    ente: [],
    atendente: [],
    tags: [],
  });

  const fetchListas = async () => {
    const { data } = await supabase.from('listas_personalizadas').select('*');
    if (!data) return;
    const agrupado: Record<Campo, { id: string; valor: string }[]> = { ente: [], atendente: [], tags: [] };
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
      setNovos({ ente: '', atendente: '', tags: '' });
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
      <div className="bg-white p-6 rounded-xl w-full max-w-xl">
        <h2 className="text-xl font-bold mb-4">Gerenciar Listas</h2>
        <div className="flex flex-col gap-4">
          {campos.map((campo) => (
            <div key={campo}>
              <label className="block text-sm font-medium mb-1 uppercase">{campo}</label>
              <input
                className="w-full border border-gray-300 rounded px-3 py-2 mb-1"
                value={novos[campo]}
                onChange={(e) => setNovos({ ...novos, [campo]: e.target.value })}
              />
              <div className="text-sm text-gray-600 flex flex-wrap gap-2">
                {listas[campo].length > 0 ? (
                  listas[campo].map((item) => (
                    <span
                      key={item.id}
                      className="bg-gray-100 border border-gray-300 rounded px-2 py-1 text-sm flex items-center gap-1"
                    >
                      {item.valor}
                      <button
                        className="text-red-500 hover:text-red-700"
                        onClick={() => remover(item.id)}
                        title="Remover"
                      >×</button>
                    </span>
                  ))
                ) : (
                  <em>(nenhum salvo)</em>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button className="bg-green-600 text-white px-4 py-2 rounded" onClick={salvar}>Salvar</button>
          <button className="bg-gray-300 px-4 py-2 rounded" onClick={onClose}>Fechar</button>
        </div>
      </div>
    </div>
  );
};
