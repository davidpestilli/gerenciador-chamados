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
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white p-6 rounded-xl max-w-xl w-full">
        <h2 className="text-lg font-semibold mb-4">{title}</h2>
        <textarea
          className="w-full h-40 border border-gray-300 p-2 rounded"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <div className="flex justify-end gap-2 mt-4">
          <button className="bg-green-600 text-white px-4 py-2 rounded" onClick={() => onSave(value)}>Salvar</button>
          <button className="bg-gray-300 px-4 py-2 rounded" onClick={onClose}>Cancelar</button>
        </div>
      </div>
    </div>
  );
};