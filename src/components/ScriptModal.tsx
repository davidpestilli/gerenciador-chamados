// src/components/ScriptModal.tsx
import React from 'react';
import { toast } from 'sonner';

interface ScriptModalProps {
  isOpen: boolean;
  texto: string;
  onClose: () => void;
}

export const ScriptModal: React.FC<ScriptModalProps> = ({ isOpen, texto, onClose }) => {
  const copiarParaClipboard = async () => {
    try {
      await navigator.clipboard.writeText(texto);
      toast.success('Texto copiado com sucesso!');
    } catch {
      toast.error('Erro ao copiar o texto');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-[9999] flex items-center justify-center">
      <div className="bg-white p-6 rounded-xl max-w-3xl w-full shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Script Gerado</h2>
          <button onClick={onClose} className="text-2xl text-gray-400 hover:text-black">×</button>
        </div>

        <textarea
          readOnly
          className="w-full h-60 border rounded p-3 text-lg text-gray-700"
          value={texto}
        />

        <div className="flex justify-end gap-2 mt-4">
          <button onClick={copiarParaClipboard} className="bg-green-600 text-white px-4 py-2 rounded">
            Copiar
          </button>
          <button onClick={onClose} className="bg-gray-300 px-4 py-2 rounded">
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
