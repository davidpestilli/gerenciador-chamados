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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40">
      <div className="bg-white p-10 rounded-3xl w-[90vw] max-w-2xl shadow-2xl border border-gray-100">
        <h2 className="text-2xl font-bold mb-8 text-center text-gray-800">Avaliação de Satisfação</h2>
        <div className="flex justify-center flex-wrap gap-6 mb-10 text-5xl">
          {opcoes.map((opcao) => (
            <button
              key={opcao.valor}
              className={`transition-transform hover:scale-110 px-5 py-3 rounded-full border-2 text-center shadow-md ${
                selecionado === opcao.valor
                  ? 'ring-4 ring-indigo-400 border-indigo-300 bg-white'
                  : 'border-gray-300 bg-white text-black hover:ring-2 hover:ring-indigo-200'
              }`}
              onClick={() => setSelecionado(opcao.valor)}
              title={opcao.label}
            >
              {opcao.emoji}
            </button>
          ))}
        </div>
        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-xl shadow-md text-lg transition-transform hover:scale-105"
          >
            Cancelar
          </button>
          <button
            onClick={salvar}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl shadow-md text-lg transition-transform hover:scale-105"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
};
