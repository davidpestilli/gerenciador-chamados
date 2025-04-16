import React, { useEffect, useState } from 'react';

interface GeradorModalProps {
  isOpen: boolean;
  onClose: () => void;
  script: { nome: string; conteudo_bruto: string };
  onGerar: (textoFinal: string) => void;
}

function parseScript(conteudo: string) {
  const partes: Array<
    | { tipo: 'texto'; valor: string }
    | { tipo: 'dropdown'; opcoes: string[] }
    | { tipo: 'input' }
  > = [];

  const regex = /\{\[((?:[^\[\]]+)(?:\]\[.*?)*?)\]\}|\(\)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(conteudo))) {
    const index = match.index;

    if (index > lastIndex) {
      partes.push({ tipo: 'texto', valor: conteudo.slice(lastIndex, index) });
    }

    if (match[0].startsWith('{[')) {
      const opcoes = match[1].split('][');
      partes.push({ tipo: 'dropdown', opcoes });
    } else if (match[0] === '()') {
      partes.push({ tipo: 'input' });
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < conteudo.length) {
    partes.push({ tipo: 'texto', valor: conteudo.slice(lastIndex) });
  }

  return partes;
}

export const GeradorModal: React.FC<GeradorModalProps> = ({ isOpen, onClose, script, onGerar }) => {
  const [partes, setPartes] = useState<ReturnType<typeof parseScript>>([]);
  const [valores, setValores] = useState<{ [index: number]: string }>({});

  useEffect(() => {
    const novasPartes = parseScript(script.conteudo_bruto);
    setPartes(novasPartes);
    const inicial: { [index: number]: string } = {};
    novasPartes.forEach((p, i) => {
      if (p.tipo === 'dropdown') inicial[i] = p.opcoes[0];
      else if (p.tipo === 'input') inicial[i] = '';
    });
    setValores(inicial);
  }, [script]);

  const handleChange = (index: number, novo: string) => {
    setValores((prev) => ({ ...prev, [index]: novo }));
  };

  const gerarTextoFinal = () => {
    let resultado = '';

    partes.forEach((parte, i) => {
      if (parte.tipo === 'texto') {
        resultado += parte.valor;
      } else {
        resultado += valores[i] ?? '';
      }
    });

    onGerar(resultado);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-[9999] flex items-center justify-center">
      <div className="bg-white p-6 rounded-xl max-w-4xl w-full shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{script.nome}</h2>
          <button onClick={onClose} className="text-2xl text-gray-400 hover:text-black">×</button>
        </div>

        <div className="flex flex-wrap gap-2 mb-6 text-lg">
          {partes.map((parte, i) => {
            if (parte.tipo === 'texto') return <span key={i}>{parte.valor}</span>;
            if (parte.tipo === 'dropdown') return (
              <select
                key={i}
                value={valores[i] ?? ''}
                onChange={(e) => handleChange(i, e.target.value)}
                className="border rounded px-2 py-1"
              >
                {parte.opcoes.map((opt, idx) => (
                  <option key={idx} value={opt}>{opt}</option>
                ))}
              </select>
            );
            return (
              <input
                key={i}
                type="text"
                value={valores[i] ?? ''}
                onChange={(e) => handleChange(i, e.target.value)}
                className="border rounded px-2 py-1"
              />
            );
          })}
        </div>

        <div className="flex justify-end gap-2">
          <button onClick={gerarTextoFinal} className="bg-blue-600 text-white px-4 py-2 rounded">Gerar</button>
          <button onClick={onClose} className="bg-gray-300 px-4 py-2 rounded">Cancelar</button>
        </div>
      </div>
    </div>
  );
};
