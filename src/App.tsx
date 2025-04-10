import { Table } from './components/Table';
import { Toaster } from 'sonner';

function App() {
  return (
    <div className="p-4">
      <Toaster position="top-center" />
      <Table />
    </div>
  );
}

export default App;
