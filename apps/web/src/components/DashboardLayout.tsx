import { useLocation, Link } from 'react-router-dom';
import { Activity, PackageSearch, PackagePlus, ArrowRightLeft, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthProvider';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const clientNav = [
  { path: '/products', label: 'Mis Productos', icon: PackagePlus },
  { path: '/inventory', label: 'Mi Inventario', icon: PackageSearch },
  { path: '/dashboard', label: 'Historial', icon: Activity },
];

const operatorNav = [
  { path: '/dashboard', label: 'Live Kardex', icon: Activity },
  { path: '/operations', label: 'Operaciones', icon: ArrowRightLeft },
  { path: '/inventory', label: 'Inventario', icon: PackageSearch },
  { path: '/products', label: 'Productos', icon: PackagePlus },
];

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const location = useLocation();
  const { user, logout } = useAuth();

  const navItems = user?.role === 'CLIENT' ? clientNav : operatorNav;

  return (
    <div className="flex h-screen w-full bg-zinc-950">
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 bg-zinc-900 border-r border-zinc-800 flex flex-col">
        <div className="px-4 py-5 border-b border-zinc-800">
          <h2 className="text-lg font-bold italic tracking-tight text-zinc-100">
            ⚡ Flash Urbano
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">WMS Control Panel</p>
        </div>

        <nav className="flex-1 py-4 px-2 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                }`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-2 py-3 border-t border-zinc-800 space-y-2">
          {user && (
            <div className="px-3 py-2">
              <p className="text-sm text-zinc-300 font-medium truncate">{user.firstName} {user.lastName}</p>
              <p className="text-xs text-zinc-600">{user.role === 'CLIENT' ? 'E-commerce' : user.role}</p>
            </div>
          )}
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-950/30 hover:text-red-300 transition-all w-full"
          >
            <LogOut size={18} />
            Cerrar Sesión
          </button>
          <p className="text-xs text-zinc-700 px-3">v2.0 — Inventario WMS</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
