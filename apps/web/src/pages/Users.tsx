import { useEffect, useState } from 'react';
import { Users as UsersIcon, Plus, UserCheck, MapPin, Trash2, Mail } from 'lucide-react';
import { api } from '../lib/axios';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';

interface Hub {
  id: string;
  name: string;
  city: string;
}

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'OPERATOR' | 'CLIENT';
  companyId: string | null;
  hubId: string | null;
  isActive: boolean;
  createdAt: string;
}

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [hubs, setHubs] = useState<Hub[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form state for NEW OPERATOR
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [hubId, setHubId] = useState('');
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      const [usersRes, hubsRes] = await Promise.all([
        api.get('/users'),
        api.get('/hubs')
      ]);
      setUsers(usersRes.data);
      setHubs(hubsRes.data);
    } catch (e) {
      console.error('Error fetching data', e);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // El Admin solo crea OPERARIOS
      await api.post('/users', {
        email,
        password,
        firstName,
        lastName,
        role: 'OPERATOR',
        hubId: hubId || undefined
      });
      await fetchData();
      resetForm();
      setShowForm(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al crear operario');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setFirstName('');
    setLastName('');
    setHubId('');
    setError('');
  };

  const handleUpdateHub = async (userId: string, newHubId: string) => {
    try {
      await api.patch(`/users/${userId}`, { hubId: newHubId || null });
      await fetchData();
    } catch (err) {
      console.error('Error updating hub', err);
    }
  };

  const handleToggleActive = async (user: User) => {
    if (!confirm(`¿Estás seguro de ${user.isActive ? 'desactivar' : 'activar'} a este usuario?`)) return;
    try {
      if (user.isActive) {
        await api.delete(`/users/${user.id}`);
      } else {
        await api.patch(`/users/${user.id}`, { isActive: true });
      }
      await fetchData();
    } catch (err) {
      console.error('Error toggling status', err);
    }
  };

  return (
    <div className="flex flex-col min-h-screen w-full bg-zinc-950 p-6 text-zinc-100">
      <header className="flex items-center justify-between pb-6 mb-6 border-b border-zinc-800">
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-zinc-100">
          <UsersIcon size={24} className="text-primary" />
          Gestión de Usuarios y Operarios
        </h1>
        <Button onClick={() => { resetForm(); setShowForm(!showForm); }} className="gap-2">
          <Plus size={16} />
          {showForm ? 'Cerrar Formulario' : 'Nuevo Operario'}
        </Button>
      </header>

      {showForm && (
        <Card className="bg-zinc-900 border-zinc-800 mb-6 max-w-2xl">
          <CardHeader>
            <CardTitle className="text-lg">Registrar Nuevo Operario de Sede</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm text-zinc-400">Nombre *</label>
                <input
                  className="bg-zinc-950 border border-zinc-800 rounded-md py-2 px-3 text-sm text-zinc-100 focus:border-primary outline-none"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-zinc-400">Apellidos *</label>
                <input
                  className="bg-zinc-950 border border-zinc-800 rounded-md py-2 px-3 text-sm text-zinc-100 focus:border-primary outline-none"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-zinc-400">Email *</label>
                <input
                  type="email"
                  className="bg-zinc-950 border border-zinc-800 rounded-md py-2 px-3 text-sm text-zinc-100 focus:border-primary outline-none"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-zinc-400">Contraseña *</label>
                <input
                  type="password"
                  className="bg-zinc-950 border border-zinc-800 rounded-md py-2 px-3 text-sm text-zinc-100 focus:border-primary outline-none"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <div className="flex flex-col gap-1 md:col-span-2">
                <label className="text-sm text-zinc-400">Asignar Sede (Opcional)</label>
                <select
                  className="bg-zinc-950 border border-zinc-800 rounded-md py-2 px-3 text-sm text-zinc-100 focus:border-primary outline-none"
                  value={hubId}
                  onChange={(e) => setHubId(e.target.value)}
                >
                  <option value="">Sin Sede Asignada</option>
                  {hubs.map(h => (
                    <option key={h.id} value={h.id}>{h.name} ({h.city})</option>
                  ))}
                </select>
              </div>
              {error && <p className="text-red-400 text-sm md:col-span-2">{error}</p>}
              <div className="md:col-span-2 flex gap-3">
                <Button type="submit" disabled={loading}>
                  {loading ? 'Creando...' : 'Crear Operario'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="border-zinc-700">
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
            <TableRow className="border-zinc-800">
              <TableHead className="text-zinc-500">USUARIO</TableHead>
              <TableHead className="text-zinc-500">ROL</TableHead>
              <TableHead className="text-zinc-500">SEDE ASIGNADA</TableHead>
              <TableHead className="text-zinc-500">ESTADO</TableHead>
              <TableHead className="text-zinc-500 text-right">ACCIONES</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id} className="border-zinc-800/50 hover:bg-zinc-800/50 transition-colors">
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-bold text-zinc-200">{u.firstName} {u.lastName}</span>
                    <span className="text-xs text-zinc-500 flex items-center gap-1">
                      <Mail size={10} /> {u.email}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={
                    u.role === 'ADMIN' ? 'border-purple-500 text-purple-400' :
                    u.role === 'OPERATOR' ? 'border-blue-500 text-blue-400' :
                    'border-zinc-500 text-zinc-400'
                  }>
                    {u.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  {u.role === 'OPERATOR' ? (
                    <select
                      className="bg-zinc-950 border border-zinc-800 rounded-md py-1 px-2 text-xs text-zinc-100 focus:border-primary outline-none w-full max-w-[200px]"
                      value={u.hubId || ''}
                      onChange={(e) => handleUpdateHub(u.id, e.target.value)}
                    >
                      <option value="">Sin Asignar</option>
                      {hubs.map(h => (
                        <option key={h.id} value={h.id}>{h.name}</option>
                      ))}
                    </select>
                  ) : (
                    <span className="text-xs text-zinc-600">N/A</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={u.isActive ? 'outline' : 'destructive'} className={u.isActive ? 'border-emerald-500 text-emerald-400' : ''}>
                    {u.isActive ? 'Activo' : 'Inactivo'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleToggleActive(u)}
                    className={u.isActive ? 'border-red-900/50 text-red-400 hover:bg-red-950' : 'border-emerald-900/50 text-emerald-400 hover:bg-emerald-950'}
                  >
                    {u.isActive ? <Trash2 size={14} /> : <UserCheck size={14} />}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
