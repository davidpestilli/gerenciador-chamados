// src/components/SatisfacaoModal.tsx
import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';

const opcoes = [
  { label: 'Muito satisfeito', valor: 'muito_satisfeito', emoji: '😁' },
  { label: 'Satisfeito', valor: 'satisfeito', emoji: '🙂' },
  { label: 'Neutro', valor: 'neutro', emoji: '😐' },
  { label: 'Insatisfeito', valor: 'insatisfeito', emoji: '🙁' },
  { label: 'Muito insatisfeito', valor: 'muito_insatisfeito', emoji: '😠' },
];

interface Props {
  isOpen: boolean;
  chamadoId: string;
  valorAtual: string;
  onClose: () => void;
  onSave: (novoValor: string) => void;
}

export const SatisfacaoModal: React.FC<Props> = ({ isOpen, chamadoId, valorAtual, onClose, onSave }) => {
  const [selecionado, setSelecionado] = useState(valorAtual);

  const salvar = async () => {
    const { error } = await supabase
      .from('chamados')
      .update({ satisfacao: selecionado })
      .eq('id', chamadoId);

    if (!error) {
      onSave(selecionado);
      onClose();
    } else {
      alert('Erro ao salvar satisfação');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white p-6 rounded-xl max-w-md w-full shadow-lg">
        <h2 className="text-xl font-bold mb-4 text-center">Avaliação de Satisfação</h2>
        <div className="flex justify-center gap-4 mb-6 text-4xl">
          {opcoes.map((opcao) => (
            <button
              key={opcao.valor}
              className={`transition-transform hover:scale-110 ${selecionado === opcao.valor ? 'ring-2 ring-blue-500 rounded-full' : ''}`}
              onClick={() => setSelecionado(opcao.valor)}
              title={opcao.label}
            >
              {opcao.emoji}
            </button>
          ))}
        </div>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="bg-gray-300 px-4 py-2 rounded">Cancelar</button>
          <button onClick={salvar} className="bg-blue-600 text-white px-4 py-2 rounded">Salvar</button>
        </div>
      </div>
    </div>
  );
};
