import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';
import { api } from '../lib/axios';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../components/ui/card';
import { Label } from '../components/ui/label';

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    companyName: '',
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Registrar y auto-login si es exitoso
      const res = await api.post('/auth/register', formData);
      const data = res.data;
      if (data && data.access_token) {
        login(data.access_token, data.user);
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al intentar registrar usuario. Inténtalo más tarde.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-zinc-950 p-4">
      {/* Círculos Glassmorphism de fondo para darle estética */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute bottom-[0%] right-[0%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[100px]" />
      </div>

      <Card className="w-full max-w-md relative z-10 bg-black/40 backdrop-blur-xl border-zinc-800 text-zinc-100">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
            <span className="text-primary italic font-black text-3xl">FLASH</span>
            URBANO
          </CardTitle>
          <CardDescription className="text-center text-zinc-400">
            Regístrate y configura tu cuenta de negocios (El primer registro será ADMIN automático)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-zinc-300">Nombre</Label>
                <Input 
                  id="firstName" 
                  required
                  placeholder="Ej. Álvaro"
                  className="bg-zinc-900/50 border-zinc-700 text-white focus-visible:ring-primary"
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-zinc-300">Apellidos</Label>
                <Input 
                  id="lastName" 
                  required
                  placeholder="Pérez"
                  className="bg-zinc-900/50 border-zinc-700 text-white focus-visible:ring-primary"
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-zinc-300">Correo Electrónico</Label>
              <Input 
                id="email" 
                type="email" 
                required
                placeholder="ejemplo@empresa.com"
                className="bg-zinc-900/50 border-zinc-700 text-white focus-visible:ring-primary"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyName" className="text-zinc-300">Nombre de tu E-commerce / Empresa</Label>
              <Input 
                id="companyName" 
                required
                placeholder="Ej. Mi Tienda Online"
                className="bg-zinc-900/50 border-zinc-700 text-white focus-visible:ring-primary"
                value={formData.companyName}
                onChange={(e) => setFormData({...formData, companyName: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-zinc-300">Contraseña</Label>
              <Input 
                id="password" 
                type="password" 
                required
                className="bg-zinc-900/50 border-zinc-700 text-white focus-visible:ring-primary"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>

            {error && <div className="text-red-500 text-sm py-2 px-3 bg-red-500/10 rounded-md border border-red-500/20">{error}</div>}

            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold" disabled={loading}>
              {loading ? 'Creando cuenta...' : 'Registrar Cuenta'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-2 border-t border-zinc-800 pt-4">
          <div className="text-center text-sm text-zinc-400">
            ¿Ya tienes una cuenta?{' '}
            <Button variant="link" className="text-primary p-0 h-auto font-semibold" onClick={() => navigate('/login')}>
              Inicia sesión aquí
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
