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
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white p-6 rounded-xl max-w-xl w-full">
        <h2 className="text-lg font-semibold mb-4">{title}</h2>
        <p className="whitespace-pre-wrap mb-4">{content || '(vazio)'}</p>
        <div className="flex justify-end gap-2">
          <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={onEdit}>Editar</button>
          <button className="bg-gray-300 px-4 py-2 rounded" onClick={onClose}>Fechar</button>
        </div>
      </div>
    </div>
  );
};