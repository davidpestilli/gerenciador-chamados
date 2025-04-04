import { Table } from '../components/Table';

export default function Home() {
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Gerenciador de Chamados</h1>
      </div>
      <Table />
    </div>
  );
}

