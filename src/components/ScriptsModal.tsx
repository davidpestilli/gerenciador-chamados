// src/components/ScriptsModal.tsx
import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { toast } from 'sonner';

interface ScriptsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenGerador: (script: { nome: string; conteudo_bruto: string }) => void;
}

export const ScriptsModal: React.FC<ScriptsModalProps> = ({ isOpen, onClose, onOpenGerador }) => {
  const [scripts, setScripts] = useState<{ id: string; nome: string; conteudo_bruto: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState('');
  const [previewNome, setPreviewNome] = useState('');
  const [editando, setEditando] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchScripts = async () => {
    const { data, error } = await supabase
      .from('scripts_customizados')
      .select('*')
      .order('criado_em', { ascending: false });
    if (error) {
      toast.error('Erro ao carregar scripts');
      return;
    }
    setScripts(data);
  };

  useEffect(() => {
    if (isOpen) fetchScripts();
  }, [isOpen]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    const nome = file.name.replace(/\.txt$/, '');
    setPreview(text);
    setPreviewNome(nome);
    setEditando(false);
    setEditingId(null);
  };

  const handleConfirmar = async () => {
    setUploading(true);
    const operacao = editingId
      ? supabase.from('scripts_customizados').update({ conteudo_bruto: preview }).eq('id', editingId)
      : supabase.from('scripts_customizados').insert({ nome: previewNome, conteudo_bruto: preview });

    const { error } = await operacao;

    if (error) {
      toast.error('Erro ao salvar script');
    } else {
      toast.success('Script salvo com sucesso!');
      setPreview('');
      setPreviewNome('');
      setEditando(false);
      setEditingId(null);
      fetchScripts();
    }

    setUploading(false);
  };

  const handleDelete = async (id: string) => {
    const confirmar = window.confirm('Deseja realmente excluir este script?');
    if (!confirmar) return;

    const { error } = await supabase.from('scripts_customizados').delete().eq('id', id);
    if (error) {
      toast.error('Erro ao excluir');
    } else {
      toast.success('Script excluído');
      fetchScripts();
    }
  };

  const handleEditarSalvo = (script: { id: string; nome: string; conteudo_bruto: string }) => {
    setPreview(script.conteudo_bruto);
    setPreviewNome(script.nome);
    setEditando(false);
    setEditingId(script.id);
  };

  const handleFecharPreview = () => {
    setPreview('');
    setPreviewNome('');
    setEditando(false);
    setEditingId(null);
    toast.info('Pré-visualização fechada');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 overflow-auto">
      <div className="bg-white p-6 rounded-xl max-w-5xl w-full shadow-lg overflow-y-auto max-h-[90vh]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Scripts - Opções</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-black text-2xl">×</button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          {scripts.map((script) => (
            <div key={script.id} className="flex items-center justify-between gap-2">
              <button
                className="bg-blue-100 hover:bg-blue-200 p-3 rounded-lg text-left shadow w-full"
                onClick={() => onOpenGerador(script)}
              >
                {script.nome}
              </button>
              <button
                className="text-green-600 hover:text-green-800 font-bold"
                title="Editar"
                onClick={() => handleEditarSalvo(script)}
              >✏️</button>
              <button
                className="text-red-500 hover:text-red-700 font-bold"
                title="Excluir"
                onClick={() => handleDelete(script.id)}
              >🗑</button>
            </div>
          ))}
        </div>

        <label className="block border border-dashed border-gray-400 p-4 rounded-lg text-center cursor-pointer hover:bg-gray-50">
          <input
            type="file"
            accept=".txt"
            onChange={handleFileUpload}
            className="hidden"
            disabled={uploading}
          />
          {uploading ? 'Enviando...' : 'Criar novo script (.txt)'}
        </label>

        {preview && (
          <div className="mt-4 border p-4 rounded bg-gray-50 max-h-[60vh] overflow-y-auto text-sm whitespace-pre-wrap">
            <strong>Pré-visualização:</strong>
            {editando ? (
              <textarea
                className="w-full mt-2 border rounded p-2"
                rows={10}
                value={preview}
                onChange={(e) => setPreview(e.target.value)}
              />
            ) : (
              <div className="mt-2">{preview}</div>
            )}
            <div className="flex justify-end gap-2 mt-4">
              {editando ? (
                <>
                  <button
                    className="bg-blue-500 text-white px-4 py-1 rounded"
                    onClick={() => setEditando(false)}
                  >
                    Feito
                  </button>
                  <button
                    className="bg-gray-400 text-white px-4 py-1 rounded"
                    onClick={handleFecharPreview}
                  >
                    Fechar
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="bg-green-600 text-white px-4 py-1 rounded"
                    onClick={handleConfirmar}
                  >
                    Confirmar
                  </button>
                  <button
                    className="bg-yellow-500 text-white px-4 py-1 rounded"
                    onClick={() => setEditando(true)}
                  >
                    Editar
                  </button>
                  <button
                    className="bg-gray-400 text-white px-4 py-1 rounded"
                    onClick={handleFecharPreview}
                  >
                    Fechar
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-end mt-6">
          <button onClick={onClose} className="bg-gray-300 px-4 py-2 rounded">Fechar</button>
        </div>
      </div>
    </div>
  );
};
