import { useState, useEffect } from 'react';
import { Plus, LayoutGrid, List, X, Package, AlertCircle, Tag, FileText, IndianRupee, Trash2 } from 'lucide-react';
import { addProduct, getProducts, updateProduct, deleteProduct } from '../../services/firebaseService';

const GammaProductManager = ({ user, userProfile }: any) => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [formData, setFormData] = useState({ name: '', details: '', price: '', offeredPrice: '' });
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [status, setStatus] = useState<{ type: string; msg: string }>({ type: '', msg: '' });

  useEffect(() => { if (user?.uid) fetchProducts(); }, [user]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      setProducts(await getProducts(user.uid));
    } catch (e) {
      console.error(e);
      setStatus({ type: 'error', msg: 'Failed to load products' });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setFormData({ name: product.name, details: product.details || '', price: product.price, offeredPrice: product.offeredPrice || '' });
    setShowModal(true);
  };

  const handleDelete = async (productId: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    setLoading(true);
    const result = await deleteProduct(productId);
    if (result.success) {
      setStatus({ type: 'success', msg: 'Product deleted!' });
      fetchProducts();
      setTimeout(() => setStatus({ type: '', msg: '' }), 3000);
    } else {
      setStatus({ type: 'error', msg: 'Delete failed' });
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price) { setStatus({ type: 'error', msg: 'Name and Price are required' }); return; }
    
    setLoading(true);
    setStatus({ type: '', msg: '' });

    try {
      const result = editingProduct 
        ? await updateProduct(editingProduct.id, formData)
        : await addProduct(formData, user.uid);

      if (result.success) {
        setStatus({ type: 'success', msg: editingProduct ? 'Updated successfully!' : 'Added successfully!' });
        setFormData({ name: '', details: '', price: '', offeredPrice: '' });
        setEditingProduct(null);
        setTimeout(() => { setShowModal(false); fetchProducts(); setStatus({ type: '', msg: '' }); }, 1500);
      } else {
        setStatus({ type: 'error', msg: result.error || 'Failed to save' });
      }
    } catch (err: any) {
      setStatus({ type: 'error', msg: 'Something went wrong' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Package size={20} className="text-primary" />
          </div>
          <div>
            <h1 className="section-title text-foreground">Inventory Hub</h1>
            <p className="section-subtitle">Manage products & pricing</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex border border-border rounded-lg overflow-hidden">
            <button className={`p-2 ${viewMode === 'grid' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-secondary/30'}`} onClick={() => setViewMode('grid')} title="Grid View"><LayoutGrid size={16} /></button>
            <button className={`p-2 ${viewMode === 'list' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-secondary/30'}`} onClick={() => setViewMode('list')} title="List View"><List size={16} /></button>
          </div>
          <button className="btn-gamma text-sm flex items-center gap-1.5" onClick={() => { setEditingProduct(null); setFormData({ name: '', details: '', price: '', offeredPrice: '' }); setShowModal(true); }}>
            <Plus size={16} /> Add Product
          </button>
        </div>
      </div>

      {loading && !products.length ? (
        <div className="text-center py-12 text-muted-foreground">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm">Fetching products...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="glass-card p-12 text-center text-muted-foreground bg-secondary/20">
          <Package size={40} className="mx-auto mb-3 opacity-30" />
          <h3 className="font-display font-medium text-foreground text-lg">No Products Found</h3>
          <p className="text-sm mt-1">Start by adding your first product to the inventory.</p>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'grid sm:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
          {products.map(p => (
            <div key={p.id} className="glass-card flex flex-col relative overflow-hidden group transition-all duration-300 hover:border-primary/30">
              <div className="p-6 flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-xl bg-primary/10 text-primary">
                    <Package size={24} />
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEdit(p)} className="p-1.5 rounded-lg hover:bg-secondary text-primary text-xs font-semibold">Edit</button>
                    <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive"><Trash2 size={16} /></button>
                  </div>
                </div>
                
                <h3 className="text-lg font-display font-bold text-foreground mb-1">{p.name}</h3>
                <p className="text-sm text-muted-foreground mb-6 line-clamp-3 min-h-[4.5rem]">{p.details || 'No details provided.'}</p>
                
                <div className="mb-6 flex items-baseline gap-2">
                  {p.offeredPrice ? (
                    <>
                      <span className="text-2xl font-bold font-display text-primary">₹{p.offeredPrice}</span>
                      <span className="text-sm text-muted-foreground line-through">₹{p.price}</span>
                    </>
                  ) : (
                    <span className="text-2xl font-bold font-display text-primary">₹{p.price}</span>
                  )}
                </div>
              </div>
              
              <div className="absolute top-0 right-0 p-4">
                <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider bg-secondary/50 px-2 py-1 rounded">#{p.id?.slice(-6)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => { if(!loading) { setShowModal(false); setEditingProduct(null); } }}>
          <div className="modal-content max-w-md w-full" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Package size={20} />
                </div>
                <h2 className="font-display font-semibold text-foreground text-xl">{editingProduct ? 'Edit' : 'Add'} Product</h2>
              </div>
              <button className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground" onClick={() => { setShowModal(false); setEditingProduct(null); }}><X size={20} /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block flex items-center gap-1.5"><Tag size={12} /> Product Name</label>
                <input className="input-gamma" placeholder="Enter product name" value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} required />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block flex items-center gap-1.5"><FileText size={12} /> Description</label>
                <textarea className="input-gamma min-h-[100px] resize-none" placeholder="Add some details about the product..." value={formData.details} onChange={e => setFormData(p => ({ ...p, details: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block flex items-center gap-1.5"><IndianRupee size={12} /> Normal Price</label>
                  <input type="number" className="input-gamma" placeholder="0" value={formData.price} onChange={e => setFormData(p => ({ ...p, price: e.target.value }))} required />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block flex items-center gap-1.5"><Tag size={12} /> Offer Price</label>
                  <input type="number" className="input-gamma" placeholder="Optional" value={formData.offeredPrice} onChange={e => setFormData(p => ({ ...p, offeredPrice: e.target.value }))} />
                </div>
              </div>

              {status.msg && (
                <div className={`p-3 rounded-lg flex items-center gap-2 text-sm ${status.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-destructive/10 text-destructive border border-destructive/20'}`}>
                  <AlertCircle size={16} />
                  <span>{status.msg}</span>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button type="button" className="flex-1 py-3 rounded-xl border border-border text-sm font-semibold text-foreground hover:bg-secondary/30 transition-all" onClick={() => { setShowModal(false); setEditingProduct(null); }}>Cancel</button>
                <button type="submit" className="flex-1 btn-gamma py-3 text-sm font-semibold shadow-lg shadow-primary/20" disabled={loading}>{loading ? 'Syncing...' : editingProduct ? 'Update Product' : 'Save Product'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GammaProductManager;
