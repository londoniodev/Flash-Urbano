import { useEffect, useState } from 'react';
import { MapPin, Plus, Edit, Trash2, Home } from 'lucide-react';
import { api } from '../lib/axios';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';

interface Hub {
  id: string;
  name: string;
  city: string;
  address: string;
  isActive: boolean;
  createdAt: string;
}

export default function Hubs() {
  const [hubs, setHubs] = useState<Hub[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');

  const fetchHubs = async () => {
    try {
      const { data } = await api.get('/hubs');
      setHubs(data);
    } catch (e) {
      console.error('Error fetching hubs', e);
    }
  };

  useEffect(() => {
    fetchHubs();
  }, []);

  const resetForm = () => {
    setName('');
    setCity('');
    setAddress('');
    setEditingId(null);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (editingId) {
        await api.patch(`/hubs/${editingId}`, { name, city, address });
      } else {
        await api.post('/hubs', { name, city, address });
      }
      await fetchHubs();
      resetForm();
      setShowForm(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al guardar la sede');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (hub: Hub) => {
    setEditingId(hub.id);
    setName(hub.name);
    setCity(hub.city);
    setAddress(hub.address);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de desactivar esta sede?')) return;
    try {
      await api.delete(`/hubs/${id}`);
      await fetchHubs();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al desactivar');
    }
  };

  return (
    <div className="flex flex-col min-h-screen w-full bg-zinc-950 p-6 text-zinc-100">
      <header className="flex items-center justify-between pb-6 mb-6 border-b border-zinc-800">
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-zinc-100">
          <MapPin size={24} className="text-primary" />
          Gestión de Sedes (Bodegas)
        </h1>
        <Button onClick={() => { resetForm(); setShowForm(!showForm); }} className="gap-2">
          <Plus size={16} />
          {showForm ? 'Cerrar Formulario' : 'Nueva Sede'}
        </Button>
      </header>

      {showForm && (
        <Card className="bg-zinc-900 border-zinc-800 mb-6 max-w-2xl">
          <CardHeader>
            <CardTitle className="text-lg">{editingId ? 'Editar Sede' : 'Registrar Nueva Sede'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm text-zinc-400">Nombre de la Sede *</label>
                <input
                  className="bg-zinc-950 border border-zinc-800 rounded-md py-2 px-3 text-sm text-zinc-100 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Bodega Norte Cali"
                  required
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-zinc-400">Ciudad *</label>
                <input
                  className="bg-zinc-950 border border-zinc-800 rounded-md py-2 px-3 text-sm text-zinc-100 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Ej: Cali, Medellín..."
                  required
                />
              </div>
              <div className="flex flex-col gap-1 md:col-span-2">
                <label className="text-sm text-zinc-400">Dirección *</label>
                <input
                  className="bg-zinc-950 border border-zinc-800 rounded-md py-2 px-3 text-sm text-zinc-100 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Ej: Calle 10 # 5-20..."
                  required
                />
              </div>
              {error && <p className="text-red-400 text-sm md:col-span-2">{error}</p>}
              <div className="md:col-span-2 flex gap-3">
                <Button type="submit" disabled={loading}>
                  {loading ? 'Guardando...' : editingId ? 'Actualizar' : 'Crear Sede'}
                </Button>
                <Button type="button" variant="outline" onClick={() => { resetForm(); setShowForm(false); }}
                  className="border-zinc-700 text-zinc-400 hover:bg-zinc-800">
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-xl overflow-y-auto">
        <Table>
          <TableHeader className="bg-zinc-950 sticky top-0 z-10 border-b border-zinc-800">
            <TableRow className="hover:bg-transparent border-zinc-800">
              <TableHead className="text-zinc-500">SEDE</TableHead>
              <TableHead className="text-zinc-500">CIUDAD</TableHead>
              <TableHead className="text-zinc-500">DIRECCIÓN</TableHead>
              <TableHead className="text-zinc-500">ESTADO</TableHead>
              <TableHead className="text-zinc-500 text-right">ACCIONES</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {hubs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-zinc-500">
                  No hay sedes registradas.
                </TableCell>
              </TableRow>
            ) : hubs.map((h) => (
              <TableRow key={h.id} className="border-zinc-800/50 hover:bg-zinc-800/50 transition-colors">
                <TableCell className="font-bold text-zinc-200">
                  <div className="flex items-center gap-2">
                    <Home size={16} className="text-primary" />
                    {h.name}
                  </div>
                </TableCell>
                <TableCell className="text-sm text-zinc-400">{h.city}</TableCell>
                <TableCell className="text-sm text-zinc-400">{h.address}</TableCell>
                <TableCell>
                  <Badge variant={h.isActive ? 'outline' : 'destructive'} className={h.isActive ? 'border-emerald-500 text-emerald-400' : ''}>
                    {h.isActive ? 'Activa' : 'Inactiva'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(h)}
                      className="border-zinc-700 text-zinc-400 hover:bg-zinc-800 h-8 w-8 p-0" title="Editar">
                      <Edit size={14} />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(h.id)}
                      className="border-red-900/50 text-red-400 hover:bg-red-950 h-8 w-8 p-0" title="Desactivar" disabled={!h.isActive}>
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
