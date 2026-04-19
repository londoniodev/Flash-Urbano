import { useEffect, useState } from 'react';
import { PackageSearch, Search } from 'lucide-react';
import { api } from '../lib/axios';
import { useAuth } from '../context/AuthProvider';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';

interface InventoryItem {
  id: string;
  quantity: number;
  hubId: string;
  product: {
    id: string;
    sku: string;
    name: string;
    companyId: string;
  };
}

export default function Inventory() {
  const [stock, setStock] = useState<InventoryItem[]>([]);
  const [search, setSearch] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const fetchStock = async () => {
      try {
        const { data } = await api.get('/inventory/stock');
        setStock(data);
      } catch (e) {
        console.error("Error fetching inventory", e);
      }
    };
    fetchStock();
  }, []);

  const filteredStock = stock.filter(item => 
    item.product.sku.toLowerCase().includes(search.toLowerCase()) || 
    item.product.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen w-full bg-zinc-950 p-6 text-zinc-100">
      
      <header className="flex items-center justify-between pb-6 mb-6 border-b border-zinc-800">
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-zinc-100">
          <PackageSearch size={24} className="text-primary" />
          Mi Inventario WMS
        </h1>
      </header>

      <Card className="bg-zinc-900 border-zinc-800 mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
            <input 
              className="w-full bg-zinc-950 border border-zinc-800 rounded-md py-2 pl-10 pr-4 text-sm text-zinc-100 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              placeholder="Buscar por SKU o Nombre de Producto..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-xl rounded-t-xl overflow-y-auto">
        <Table>
          <TableHeader className="bg-zinc-950 sticky top-0 z-10 border-b border-zinc-800">
            <TableRow className="hover:bg-transparent border-zinc-800">
              <TableHead className="text-zinc-500">PRODUCTO (SKU)</TableHead>
              <TableHead className="text-zinc-500">NOMBRE</TableHead>
              <TableHead className="text-zinc-500">SEDE / HUB</TableHead>
              <TableHead className="text-zinc-500 text-right">CANTIDAD DISPONIBLE</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStock.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center text-zinc-500">
                  No se encontraron productos en stock.
                </TableCell>
              </TableRow>
            ) : filteredStock.map((item) => (
              <TableRow key={item.id} className="border-zinc-800/50 hover:bg-zinc-800/50 transition-colors">
                <TableCell className="font-mono text-sm font-medium text-zinc-200">
                  {item.product.sku}
                </TableCell>
                <TableCell className="text-sm text-zinc-300">
                  {item.product.name}
                </TableCell>
                <TableCell className="text-sm text-zinc-400">
                  {/* Idealmente aquí se haría un join con la tabla Hubs para mostrar el nombre */}
                  {item.hubId}
                </TableCell>
                <TableCell className="font-mono text-sm font-bold text-primary text-right">
                  {item.quantity.toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
