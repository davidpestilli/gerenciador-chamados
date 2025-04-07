import React, { useEffect, useRef, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { supabase } from '../services/supabaseClient';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7f50', '#00c49f', '#ff69b4', '#a0522d', '#4682b4'];

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const EstatisticasModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [dados, setDados] = useState<{ nome: string; valor: number }[]>([]);
  const [opcaoSelecionada, setOpcaoSelecionada] = useState('chamadosPorEnte');
  const graficoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const carregarDados = async () => {
      const { data } = await supabase.from('chamados').select('ente');
      if (!data) return;
      const contagem: Record<string, number> = {};
      data.forEach(({ ente }) => {
        contagem[ente] = (contagem[ente] || 0) + 1;
      });
      const arr = Object.entries(contagem).map(([nome, valor]) => ({ nome, valor }));
      setDados(arr);
    };

    carregarDados();
  }, [isOpen]);

  const totalChamados = dados.reduce((acc, cur) => acc + cur.valor, 0);

  const prepararParaExportar = () => {
    document.querySelectorAll('.export-only').forEach((el) => {
      (el as HTMLElement).style.display = 'block';
    });
  };

  const limparExportacao = () => {
    document.querySelectorAll('.export-only').forEach((el) => {
      (el as HTMLElement).style.display = 'none';
    });
  };

  const exportarPDF = async () => {
    if (!graficoRef.current) return;
    prepararParaExportar();
    const canvas = await html2canvas(graficoRef.current);
    limparExportacao();

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('landscape', 'pt', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const ratio = Math.min(pageWidth / canvas.width, pageHeight / canvas.height);
    const imgWidth = canvas.width * ratio;
    const imgHeight = canvas.height * ratio;

    pdf.addImage(imgData, 'PNG', (pageWidth - imgWidth) / 2, 40, imgWidth, imgHeight);
    pdf.save('estatisticas.pdf');
  };

  const exportarPNG = async () => {
    if (!graficoRef.current) return;
    prepararParaExportar();
    const canvas = await html2canvas(graficoRef.current);
    limparExportacao();

    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = 'estatisticas.png';
    link.click();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl max-w-6xl w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Estatísticas</h2>
          <select
            className="border p-2 rounded"
            value={opcaoSelecionada}
            onChange={(e) => setOpcaoSelecionada(e.target.value)}
          >
            <option value="chamadosPorEnte">Chamados por Ente</option>
          </select>
        </div>

        <div
          ref={graficoRef}
          className="bg-white p-4 rounded border flex flex-col lg:flex-row items-start gap-6"
        >
          <div style={{ width: '100%', height: 500, flex: 1 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={dados}
                  dataKey="valor"
                  nameKey="nome"
                  cx="50%"
                  cy="50%"
                  outerRadius={180}
                  labelLine
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  isAnimationActive={true}
                  animationBegin={0}
                  animationDuration={1000}
                  animationEasing="ease-out"
                >
                  {dados.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

{/* Total visível na tela */}
<div className="text-lg font-semibold text-gray-700 mb-6 text-center">
  Total de chamados: <span className="text-blue-600">{totalChamados}</span>
</div>

{/* Seção oculta para exportação */}
<div className="export-only hidden" style={{ minWidth: 300 }}>
  <div className="text-lg font-semibold text-gray-700 mb-2">
    Total de chamados: <span className="text-blue-600">{totalChamados}</span>
  </div>
  <h3 className="text-md font-bold mb-1 text-gray-700">Distribuição por Ente:</h3>
  <ul className="text-sm text-gray-800 pl-4 list-disc">
    {dados.map((dado) => (
      <li key={dado.nome}>
        <strong>{dado.nome}</strong>: {dado.valor} chamados
      </li>
    ))}
  </ul>
</div>

        </div>

        <div className="flex justify-end mt-6 gap-2">
          <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={exportarPDF}>Exportar PDF</button>
          <button className="bg-purple-600 text-white px-4 py-2 rounded" onClick={exportarPNG}>Exportar PNG</button>
          <button className="bg-gray-300 px-4 py-2 rounded" onClick={onClose}>Fechar</button>
        </div>
      </div>
    </div>
  );
};
