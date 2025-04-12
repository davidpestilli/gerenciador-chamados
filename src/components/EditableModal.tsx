// src/components/EditableModal.tsx
import React, { useState } from 'react';

interface EditableModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialValue: string;
  onSave: (value: string) => void;
  title: string;
}

export const EditableModal: React.FC<EditableModalProps> = ({ isOpen, onClose, initialValue, onSave, title }) => {
  const [value, setValue] = useState(initialValue);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40">
      <div className="bg-white shadow-2xl rounded-3xl p-10 w-full max-w-3xl border border-gray-100 transition-all duration-300">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl font-bold">×</button>
        </div>
        <textarea
          className="w-full h-48 border border-gray-300 p-4 rounded-xl text-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <div className="flex justify-end gap-3 mt-6">
          <button
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl shadow-md text-lg"
            onClick={() => onSave(value)}
          >
            Salvar
          </button>
          <button
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-xl shadow-md text-lg"
            onClick={onClose}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};
