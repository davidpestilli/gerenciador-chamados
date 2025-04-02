// src/pages/Home.tsx
import { Table } from '../components/Table';
export default function Home() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Gerenciador de Chamados</h1>
      <Table />
    </div>
  );
}