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
      <div className="bg-white shadow-2xl rounded-3xl p-10 w-full max-w-5xl border border-gray-100 transition-all duration-300">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl font-bold">×</button>
        </div>
        <div className="mb-6">
          <p className="whitespace-pre-wrap text-gray-700 text-lg leading-relaxed">{content || '(vazio)'}</p>
        </div>
        <div className="flex justify-end gap-3">
        <button
  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl shadow-md text-lg"
  onClick={onEdit}
>
  Editar
</button>

          <button
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-xl"
            onClick={onClose}
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
