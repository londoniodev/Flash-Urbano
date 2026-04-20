import { useEffect, useState, useRef } from 'react';
import { PackagePlus, Trash2, Edit, QrCode, Eye, Download, Upload } from 'lucide-react';
import * as XLSX from 'xlsx';
import { exportToExcel } from '../utils/exportExcel';
import { api } from '../lib/axios';
import { useAuth } from '../context/AuthProvider';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import ProductPassportModal from '../components/ProductPassportModal';
import ProductQRModal from '../components/ProductQRModal';

interface Product {
  id: string;
  sku: string;
  name: string;
  category?: string;
  brand?: string;
  imageUrl?: string;
  barcode?: string;
  description?: string;
  companyId: string;
  companyName: string;
  createdAt: string;
}

interface Hub {
  id: string;
  name: string;
  city: string;
}

export default function Products() {
  const { user } = useAuth();
  const isOperator = user?.role === 'ADMIN' || user?.role === 'OPERATOR';
  const isClient = user?.role === 'CLIENT';
  const canManage = isOperator || isClient;
  
  const [products, setProducts] = useState<Product[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [passportProductId, setPassportProductId] = useState<string | null>(null);
  const [qrProductId, setQrProductId] = useState<string | null>(null);

  // Form state
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [brand, setBrand] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [barcode, setBarcode] = useState('');
  const [description, setDescription] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [companies, setCompanies] = useState<{ id: string; name: string }[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [hubs, setHubs] = useState<Hub[]>([]);
  const [hubId, setHubId] = useState('');
  const [initialStock, setInitialStock] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchProducts = async () => {
    try {
      const { data } = await api.get('/products');
      setProducts(data);
    } catch (e) {
      console.error('Error fetching products', e);
    }
  };

  const fetchCompanies = async () => {
    if (!isOperator) return; // Clientes no listan otras empresas
    try {
      const { data } = await api.get('/companies');
      setCompanies(data);
      if (data.length > 0 && !companyId) {
        setCompanyId(data[0].id);
      }
    } catch (e) {
      console.error('Error fetching companies', e);
    }
  };

  const fetchHubs = async () => {
    try {
      const { data } = await api.get('/hubs');
      setHubs(data);
      if (data.length > 0) setHubId(data[0].id);
    } catch (e) {
      console.error('Error fetching hubs', e);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchHubs();
    if (isOperator) {
      fetchCompanies();
    }
  }, [isOperator]);

  const resetForm = () => {
    setSku('');
    setName('');
    setCategory('');
    setBrand('');
    setImageUrl('');
    setBarcode('');
    setDescription('');
    setEditingId(null);
    setError('');
    setInitialStock(0);
    // Si es cliente, asegurar que el companyId siempre sea el suyo
    if (isClient && user?.companyId) {
      setCompanyId(user.companyId);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (editingId) {
        await api.patch(`/products/${editingId}`, { name, category, brand, imageUrl, barcode, description });
      } else {
        await api.post('/products', { sku, name, category, brand, imageUrl, barcode, description, companyId, initialStock, hubId });
      }
      await fetchProducts();
      resetForm();
      setShowForm(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al guardar producto');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setSku(product.sku);
    setName(product.name);
    setCategory(product.category || '');
    setBrand(product.brand || '');
    setImageUrl(product.imageUrl || '');
    setBarcode(product.barcode || '');
    setDescription(product.description || '');
    setCompanyId(product.companyId);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return;
    try {
      await api.delete(`/products/${id}`);
      await fetchProducts();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al eliminar');
    }
  };

  const handleDownloadTemplate = () => {
    const template = [
      {
        SKU: 'EJEMPLO-001',
        NOMBRE: 'Producto de Ejemplo',
        CATEGORIA: 'Electrónica',
        MARCA: 'MarcaX',
        BARCODE: '1234567890123',
        DESCRIPCION: 'Breve descripción del producto',
        IMAGE_URL: 'https://link-a-imagen.com/foto.jpg',
        HUB_ID: hubs[0]?.id || 'uuid-de-sede',
        STOCK_INICIAL: 10
      }
    ];
    exportToExcel(template, 'plantilla_carga_productos', 'Productos');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError('');

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

      // Mapear campos del Excel a CreateProductDto
      const dtos = jsonData.map(row => ({
        sku: row.SKU?.toString(),
        name: row.NOMBRE?.toString(),
        category: row.CATEGORIA?.toString(),
        brand: row.MARCA?.toString(),
        barcode: row.BARCODE?.toString(),
        description: row.DESCRIPCION?.toString(),
        imageUrl: row.IMAGE_URL?.toString(),
        hubId: row.HUB_ID?.toString() || hubId,
        initialStock: Number(row.STOCK_INICIAL) || 0,
        companyId: companyId // Se asignará correctamente en el backend para clientes
      })).filter(p => p.sku && p.name);

      if (dtos.length === 0) {
        throw new Error('No se encontraron productos válidos en el archivo');
      }

      await api.post('/products/bulk', dtos);
      alert(`Se han cargado ${dtos.length} productos correctamente`);
      fetchProducts();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Error al procesar el archivo');
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col min-h-screen w-full bg-zinc-950 p-6 text-zinc-100">

      <header className="flex items-center justify-between pb-6 mb-6 border-b border-zinc-800">
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-zinc-100">
          <PackagePlus size={24} className="text-primary" />
          {isClient ? 'Mis Productos' : 'Catálogo de Productos (SKUs)'}
        </h1>
        <div className="flex gap-3">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            accept=".xlsx, .xls, .csv" 
            className="hidden" 
          />
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            className="gap-2 border-zinc-700 text-zinc-400 hover:bg-zinc-800"
          >
            <Upload size={16} />
            {loading ? 'Subiendo...' : 'Subir Excel'}
          </Button>
          <Button
            variant="outline"
            onClick={handleDownloadTemplate}
            className="gap-2 border-zinc-700 text-zinc-400 hover:bg-zinc-800"
          >
            <Download size={16} />
            Plantilla
          </Button>
          {canManage && (
            <Button
              onClick={() => { resetForm(); setShowForm(!showForm); }}
              className="gap-2"
            >
              <PackagePlus size={16} />
              {showForm ? 'Cerrar Formulario' : 'Nuevo Producto'}
            </Button>
          )}
        </div>
      </header>

      {/* FORMULARIO */}
      {showForm && (
        <Card className="bg-zinc-900 border-zinc-800 mb-6">
          <CardHeader>
            <CardTitle className="text-lg">{editingId ? 'Editar Producto' : 'Crear Nuevo Producto'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm text-zinc-400">SKU *</label>
                <input
                  className="bg-zinc-950 border border-zinc-800 rounded-md py-2 px-3 text-sm text-zinc-100 focus:border-primary focus:ring-1 focus:ring-primary outline-none disabled:opacity-50"
                  value={sku}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSku(e.target.value)}
                  placeholder="Ej: CAMI-001-AZL"
                  required
                  disabled={!!editingId}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-zinc-400">Nombre *</label>
                <input
                  className="bg-zinc-950 border border-zinc-800 rounded-md py-2 px-3 text-sm text-zinc-100 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  value={name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                  placeholder="Ej: Camiseta Azul Talla L"
                  required
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-zinc-400">Categoría</label>
                <input
                  className="bg-zinc-950 border border-zinc-800 rounded-md py-2 px-3 text-sm text-zinc-100 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  value={category}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCategory(e.target.value)}
                  placeholder="Ej: Camisetas, Zapatos"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-zinc-400">Marca</label>
                <input
                  className="bg-zinc-950 border border-zinc-800 rounded-md py-2 px-3 text-sm text-zinc-100 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  value={brand}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBrand(e.target.value)}
                  placeholder="Ej: Nike, Adidas"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-zinc-400">Código de Barras</label>
                <input
                  className="bg-zinc-950 border border-zinc-800 rounded-md py-2 px-3 text-sm text-zinc-100 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  value={barcode}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBarcode(e.target.value)}
                  placeholder="EAN-13, UPC, etc."
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-zinc-400">URL Imagen</label>
                <input
                  className="bg-zinc-950 border border-zinc-800 rounded-md py-2 px-3 text-sm text-zinc-100 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  value={imageUrl}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setImageUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>
              {isOperator && !editingId && (
                <div className="flex flex-col gap-1">
                  <label className="text-sm text-zinc-400">Empresa *</label>
                  <select
                    className="bg-zinc-950 border border-zinc-800 rounded-md py-2 px-3 text-sm text-zinc-100 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                    value={companyId}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCompanyId(e.target.value)}
                    required
                  >
                    {companies.map((c: any) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {isOperator && !editingId && (
                <>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm text-zinc-400">Sede para Stock Inicial *</label>
                    <select
                      className="bg-zinc-950 border border-zinc-800 rounded-md py-2 px-3 text-sm text-zinc-100 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                      value={hubId}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setHubId(e.target.value)}
                      required
                    >
                      {hubs.map((h: any) => (
                        <option key={h.id} value={h.id}>{h.name} ({h.city})</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm text-zinc-400">Cantidad Inicial *</label>
                    <input
                      type="number"
                      className="bg-zinc-950 border border-zinc-800 rounded-md py-2 px-3 text-sm text-zinc-100 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                      value={initialStock}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInitialStock(Number(e.target.value))}
                      min="0"
                      required
                    />
                  </div>
                </>
              )}
              <div className="flex flex-col gap-1 md:col-span-2">
                <label className="text-sm text-zinc-400">Descripción</label>
                <textarea
                  className="bg-zinc-950 border border-zinc-800 rounded-md py-2 px-3 text-sm text-zinc-100 focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none"
                  value={description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
                  rows={2}
                  placeholder="Descripción opcional del producto..."
                />
              </div>
              {error && <p className="text-red-400 text-sm md:col-span-2">{error}</p>}
              <div className="md:col-span-2 flex gap-3">
                <Button type="submit" disabled={loading}>
                  {loading ? 'Guardando...' : editingId ? 'Actualizar' : 'Crear Producto'}
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

      {/* TABLA */}
      <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-xl overflow-y-auto">
        <Table>
          <TableHeader className="bg-zinc-950 sticky top-0 z-10 border-b border-zinc-800">
            <TableRow className="hover:bg-transparent border-zinc-800">
              <TableHead className="text-zinc-500">SKU</TableHead>
              {isOperator && <TableHead className="text-zinc-500">CLIENTE</TableHead>}
              <TableHead className="text-zinc-500">NOMBRE</TableHead>
              <TableHead className="text-zinc-500">CATEGORÍA</TableHead>
              <TableHead className="text-zinc-500">MARCA</TableHead>
              <TableHead className="text-zinc-500 text-right">ACCIONES</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-zinc-500">
                  No hay productos registrados. Crea tu primer SKU.
                </TableCell>
              </TableRow>
            ) : products.map((p: any) => (
              <TableRow key={p.id} className="border-zinc-800/50 hover:bg-zinc-800/50 transition-colors cursor-pointer" onClick={() => setPassportProductId(p.id)}>
                <TableCell className="font-mono text-sm font-medium text-primary">
                  {p.sku}
                </TableCell>
                {isOperator && (
                  <TableCell className="text-sm font-bold text-zinc-100">
                    {p.companyName}
                  </TableCell>
                )}
                <TableCell className="text-sm text-zinc-300">
                  {p.name}
                </TableCell>
                <TableCell className="text-xs text-zinc-400">{p.category || '—'}</TableCell>
                <TableCell className="text-xs text-zinc-400">{p.brand || '—'}</TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-2 justify-end" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                    <Button variant="outline" size="sm" onClick={() => setPassportProductId(p.id)}
                      className="border-zinc-700 text-zinc-400 hover:bg-zinc-800 h-8 w-8 p-0" title="Ver Hoja de Vida">
                      <Eye size={14} />
                    </Button>
                      <Button variant="outline" size="sm" onClick={() => setQrProductId(p.id)}
                        className="border-zinc-700 text-zinc-400 hover:bg-zinc-800 h-8 w-8 p-0" title="Imprimir QR">
                        <QrCode size={14} />
                      </Button>
                    {canManage && (
                      <>
                        <Button variant="outline" size="sm" onClick={() => handleEdit(p)}
                          className="border-zinc-700 text-zinc-400 hover:bg-zinc-800 h-8 w-8 p-0" title="Editar">
                          <Edit size={14} />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(p.id)}
                          className="border-red-900/50 text-red-400 hover:bg-red-950 h-8 w-8 p-0" title="Eliminar">
                          <Trash2 size={14} />
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ProductPassportModal productId={passportProductId} onClose={() => setPassportProductId(null)} />
      <ProductQRModal productId={qrProductId} onClose={() => setQrProductId(null)} />
    </div>
  );
}
