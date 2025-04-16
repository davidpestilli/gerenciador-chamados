// src/components/ScriptsModal.tsx
import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';

interface ScriptsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenGerador: (script: { nome: string; conteudo_bruto: string }) => void;
}

export const ScriptsModal: React.FC<ScriptsModalProps> = ({ isOpen, onClose, onOpenGerador }) => {
  const [scripts, setScripts] = useState<{ id: string; nome: string; conteudo_bruto: string }[]>([]);
  const [uploading, setUploading] = useState(false);

  const fetchScripts = async () => {
    const { data, error } = await supabase
      .from('scripts_customizados')
      .select('*')
      .order('criado_em', { ascending: false });
    if (error) {
      alert('Erro ao carregar scripts');
      return;
    }
    setScripts(data);
  };

  useEffect(() => {
    if (isOpen) fetchScripts();
  }, [isOpen]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const text = await file.text();
    const nome = file.name.replace(/\.txt$/, '');

    const { error } = await supabase.from('scripts_customizados').insert({
      nome,
      conteudo_bruto: text,
    });

    if (error) {
      alert('Erro ao salvar script: ' + error.message);
    } else {
      fetchScripts();
    }

    setUploading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white p-6 rounded-xl max-w-2xl w-full shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Scripts - Opções</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-black text-2xl">×</button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          {scripts.map((script) => (
            <button
              key={script.id}
              className="bg-blue-100 hover:bg-blue-200 p-3 rounded-lg text-left shadow"
              onClick={() => onOpenGerador(script)}
            >
              {script.nome}
            </button>
          ))}
        </div>

        <label className="block border border-dashed border-gray-400 p-4 rounded-lg text-center cursor-pointer hover:bg-gray-50">
          <input
            type="file"
            accept=".txt"
            onChange={handleFileUpload}
            className="hidden"
            disabled={uploading}
          />
          {uploading ? 'Enviando...' : 'Criar novo script (.txt)'}
        </label>

        <div className="flex justify-end mt-6">
          <button onClick={onClose} className="bg-gray-300 px-4 py-2 rounded">Fechar</button>
        </div>
      </div>
    </div>
  );
};
