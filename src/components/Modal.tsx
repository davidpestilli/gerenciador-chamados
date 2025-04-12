// src/components/Modal.tsx
import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
  onEdit: () => void;
  title: string;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, content, onEdit, title }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40">
<div className="bg-white shadow-xl rounded-2xl p-12 w-full max-w-5xl transition-opacity duration-300 opacity-100">

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
        </div>
        <div className="mb-6">
<p className="whitespace-pre-wrap text-gray-700 text-xl">{content || '(vazio)'}</p>

        </div>
        <div className="flex justify-end gap-2">
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-sm transition"
            onClick={onEdit}
          >
            Editar
          </button>
          <button
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg shadow-sm transition"
            onClick={onClose}
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
