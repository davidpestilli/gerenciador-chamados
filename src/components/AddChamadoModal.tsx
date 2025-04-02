import React, { useState } from 'react';
import { Chamado } from '../types/Chamado';

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

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm({ ...form, [field]: field === 'tags' ? value.split(',').map(t => t.trim()) : value });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl max-w-2xl w-full">
        <h2 className="text-xl font-semibold mb-4">Novo Chamado</h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          {Object.entries(form).map(([key, value]) => (
            <div key={key} className="flex flex-col col-span-2 sm:col-span-1">
              <label className="text-sm text-gray-600 mb-1">{key.replace('_', ' ').toUpperCase()}</label>
              {['resumo', 'texto_chamado', 'texto_resposta'].includes(key) ? (
                <textarea
                  className="border border-gray-300 p-2 rounded h-28"
                  value={Array.isArray(value) ? value.join(', ') : value}
                  onChange={(e) => handleChange(key as keyof typeof form, e.target.value)}
                />
              ) : (
                <input
                  className="border border-gray-300 p-2 rounded"
                  value={Array.isArray(value) ? value.join(', ') : value}
                  onChange={(e) => handleChange(key as keyof typeof form, e.target.value)}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-2">
          <button className="bg-green-600 text-white px-4 py-2 rounded" onClick={() => onSave(form)}>Salvar</button>
          <button className="bg-gray-300 px-4 py-2 rounded" onClick={onClose}>Cancelar</button>
        </div>
      </div>
    </div>
  );
};