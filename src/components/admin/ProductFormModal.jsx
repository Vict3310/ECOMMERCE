import React, { useState, useEffect } from 'react';
import { ShoppingCart, Phone, Save, X, Plus, Trash2, Camera, Info } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { supabase } from '../../supabase';
import { compressImageFile } from '../../utils/compressImage';

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const MAX_GALLERY_IMAGES = 20;

const ProductFormModal = ({ isOpen, onClose, product = null }) => {
  const { setProducts, showNotification } = useAppContext();
  const [formData, setFormData] = useState({
    name: '', brand: '', category: 'Phones', 
    prices: { brandNew: '', ukUsed: '' },
    specs: {}, description: '', image: '', images: [],
    batteryHealth: '', isDeal: false, colors: [], stock: 0
  });
  const [isUploading, setIsUploading] = useState(false);
  const [specKey, setSpecKey] = useState('');
  const [specValue, setSpecValue] = useState('');
  const [saveStatus, setSaveStatus] = useState(null); // null | 'pending' | 'success' | 'error'
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    if (product) {
      const imgs = Array.isArray(product.images) && product.images.length > 0
        ? [...product.images]
        : (product.image ? [product.image] : []);
      setFormData({
        batteryHealth: '', isDeal: false, stock: 0,
        ...product,
        images: imgs,
        image: imgs[0] || product.image || '',
      });
    } else {
      setFormData({
        name: '', brand: '', category: 'Phones',
        prices: { brandNew: '', ukUsed: '' },
        specs: {}, description: '', image: '', images: [],
        batteryHealth: '', isDeal: false, colors: [], stock: 0
      });
    }
  }, [product, isOpen]);

  const handleImagesUpload = async (e) => {
    const raw = [...(e.target.files || [])];
    if (!raw.length) return;

    const imagesOnly = raw.filter((f) => f.type.startsWith('image/'));
    if (imagesOnly.length < raw.length) {
      showNotification('Non-image files were skipped.', 'info');
    }

    const currentCount = formData.images?.length || 0;
    const room = MAX_GALLERY_IMAGES - currentCount;
    if (room <= 0) {
      showNotification(`Maximum ${MAX_GALLERY_IMAGES} images per product.`, 'error');
      e.target.value = '';
      return;
    }

    const tooBig = imagesOnly.filter((f) => f.size > MAX_IMAGE_BYTES);
    const okFiles = imagesOnly.filter((f) => f.size <= MAX_IMAGE_BYTES);
    if (tooBig.length) {
      showNotification(`${tooBig.length} file(s) skipped (over 8MB each).`, 'error');
    }
    if (!okFiles.length) {
      e.target.value = '';
      return;
    }

    const toUpload = okFiles.slice(0, room);
    if (okFiles.length > room) {
      showNotification(`Only ${room} more slot(s) available; extra files not uploaded.`, 'info');
    }

    setIsUploading(true);
    try {
      const newUrls = [];
      for (const file of toUpload) {
        const prepared = await compressImageFile(file);
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}-${prepared.name}`;
        const { error: uploadError } = await supabase.storage.from('products').upload(fileName, prepared);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('products').getPublicUrl(fileName);
        newUrls.push(publicUrl);
      }
      setFormData((prev) => {
        const merged = [...(prev.images || []), ...newUrls];
        return { ...prev, images: merged, image: merged[0] || prev.image };
      });
    } catch (error) {
      console.error("Storage Error Details:", error);
      showNotification(`Upload failed: ${error.message || 'Unknown error'}`, 'error');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const removeGalleryImage = (index) => {
    setFormData((prev) => {
      const next = (prev.images || []).filter((_, i) => i !== index);
      return { ...prev, images: next, image: next[0] || '' };
    });
  };

  const setCoverImage = (index) => {
    if (index === 0) return;
    setFormData((prev) => {
      const next = [...(prev.images || [])];
      const [item] = next.splice(index, 1);
      next.unshift(item);
      return { ...prev, images: next, image: next[0] || '' };
    });
  };

  const addSpec = () => {
    if (!specKey || !specValue) return;
    setFormData(prev => ({ 
      ...prev, 
      specs: { ...prev.specs, [specKey]: specValue } 
    }));
    setSpecKey('');
    setSpecValue('');
  };

  const removeSpec = (key) => {
    const newSpecs = { ...formData.specs };
    delete newSpecs[key];
    setFormData(prev => ({ ...prev, specs: newSpecs }));
  };

  const applyTemplate = (type) => {
    const templates = {
      iphone: {
        category: 'Phones', brand: 'Apple',
        specs: { Storage: '128GB', RAM: '8GB', Network: '5G', Chip: 'Apple A-Series' }
      },
      samsung: {
        category: 'Phones', brand: 'Samsung',
        specs: { Storage: '256GB', RAM: '12GB', Display: 'Dynamic AMOLED', Camera: '200MP' }
      },
      macbook: {
        category: 'Laptops', brand: 'Apple',
        specs: { Storage: '512GB SSD', RAM: '16GB Unified', Display: 'Liquid Retina XDR', Processor: 'M3 Pro' }
      }
    };
    if (templates[type]) {
      setFormData(prev => ({ 
        ...prev, 
        ...templates[type],
        specs: { ...prev.specs, ...templates[type].specs } 
      }));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const imgs = (formData.images || []).filter(Boolean);
    if (imgs.length === 0) {
      showNotification('Add at least one product image.', 'error');
      return;
    }
    const normalizedProduct = {
      ...product,
      ...formData,
      image: imgs[0],
      images: imgs,
      stock: Number(formData.stock || 0),
      prices: {
        brandNew: Number(formData.prices?.brandNew || 0),
        ukUsed: Number(formData.prices?.ukUsed || 0)
      },
      isDeal: Boolean(formData.isDeal),
      specs: formData.specs || {},
      updatedAt: new Date().toISOString()
    };

    setSaveStatus('pending');
    setSaveMessage('Saving product…');

    try {
      if (product && product.id) {
        const { error } = await supabase.from('products').update(normalizedProduct).eq('id', product.id);
        if (error) throw error;
        setProducts(prev => prev.map(p => p.id === product.id ? normalizedProduct : p));
        setSaveStatus('success');
        setSaveMessage('Product updated successfully.');
      } else {
        const newProduct = { ...normalizedProduct, id: Date.now().toString(), created_at: new Date().toISOString() };
        const { error } = await supabase.from('products').insert(newProduct);
        if (error) throw error;
        setProducts(prev => [...prev, newProduct]);
        setSaveStatus('success');
        setSaveMessage('Product added successfully.');
      }

      window.setTimeout(() => {
        setSaveStatus(null);
        setSaveMessage('');
        onClose();
      }, 900);
    } catch (error) {
      console.warn("Save failed.", error);
      setSaveStatus('error');
      setSaveMessage(error.message || 'Save failed. Please check your connection and try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-wrapper-mobile" style={{ position: 'fixed', inset: 0, zIndex: 10000, backgroundColor: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(20px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div className="fade-in modal-content-mobile hide-scrollbar" style={{ width: '100%', maxWidth: '900px', backgroundColor: 'var(--bg-primary)', border: 'var(--border-thin)', maxHeight: '90vh', overflowY: 'auto', position: 'relative', boxShadow: '0 40px 100px rgba(0,0,0,0.8)' }}>
        <div className="thin-border-bottom mobile-p-24" style={{ padding: '32px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, backgroundColor: 'var(--bg-primary)', zIndex: 10 }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
              <h2 style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.2em', color: 'var(--text-primary)' }}>{product ? 'EDIT PRODUCT' : 'NEW PRODUCT'}</h2>
              <div style={{ display: 'flex', gap: '8px' }}>
                 <button type="button" onClick={() => applyTemplate('iphone')} style={{ padding: '6px 12px', fontSize: '9px', fontWeight: 800, border: 'var(--border-thin)', borderRadius: '2px', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>IPHONE PRESET</button>
                 <button type="button" onClick={() => applyTemplate('samsung')} style={{ padding: '6px 12px', fontSize: '9px', fontWeight: 800, border: 'var(--border-thin)', borderRadius: '2px', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>SAMSUNG PRESET</button>
                 <button type="button" onClick={() => applyTemplate('macbook')} style={{ padding: '6px 12px', fontSize: '9px', fontWeight: 800, border: 'var(--border-thin)', borderRadius: '2px', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>MACBOOK PRESET</button>
              </div>
           </div>
           <button onClick={onClose} style={{ color: 'var(--text-primary)' }}><X size={20} /></button>
        </div>

        <form onSubmit={handleSave} className="mobile-p-24" style={{ padding: '48px' }}>
          {saveStatus && (
            <div style={{
              marginBottom: '32px',
              padding: '16px 20px',
              borderRadius: '4px',
              border: '1px solid',
              borderColor: saveStatus === 'success' ? '#2dd4bf' : saveStatus === 'error' ? '#f97316' : '#60a5fa',
              backgroundColor: saveStatus === 'success' ? 'rgba(45,212,191,0.12)' : saveStatus === 'error' ? 'rgba(249,115,22,0.12)' : 'rgba(96,165,250,0.12)',
              color: saveStatus === 'success' ? '#0f766e' : saveStatus === 'error' ? '#c2410c' : '#1d4ed8',
              fontSize: '12px',
              fontWeight: 700
            }}>
              {saveMessage}
            </div>
          )}
          <div className="admin-grid-2" style={{ gap: '64px' }}>
            {/* Left: General Info */}
            <div style={{ display: 'grid', gap: '32px' }}>
              <div>
                <label style={{ fontSize: '9px', fontWeight: 800, opacity: 0.4, textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Product Name</label>
                <input required type="text" value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} style={{ width: '100%', padding: '16px', border: 'var(--border-thin)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', fontWeight: 800, borderRadius: '2px' }} />
              </div>
              <div className="admin-grid-2">
                 <div>
                    <label style={{ fontSize: '9px', fontWeight: 800, opacity: 0.4, textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Brand</label>
                    <input required type="text" value={formData.brand} onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))} style={{ width: '100%', padding: '16px', border: 'var(--border-thin)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', fontWeight: 800, borderRadius: '2px' }} />
                 </div>
                 <div>
                    <label style={{ fontSize: '9px', fontWeight: 800, opacity: 0.4, textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Category</label>
                    <select value={formData.category} onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))} style={{ width: '100%', padding: '16px', border: 'var(--border-thin)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', fontWeight: 800, borderRadius: '2px', cursor: 'pointer' }}>
                       <option value="Phones">Phones</option>
                       <option value="Laptops">Laptops</option>
                       <option value="Accessories">Accessories</option>
                    </select>
                 </div>
              </div>

              {/* Automated Sales Spec Fields (Epic 14) */}
              <div className="admin-grid-2">
                 <div>
                    <label style={{ fontSize: '9px', fontWeight: 800, opacity: 0.4, textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Battery % / Status</label>
                    <input type="text" placeholder="e.g. 98% or Normal" value={formData.batteryHealth} onChange={(e) => setFormData(prev => ({ ...prev, batteryHealth: e.target.value }))} style={{ width: '100%', padding: '16px', border: 'var(--border-thin)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', fontWeight: 800, borderRadius: '2px' }} />
                 </div>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingTop: '24px' }}>
                    <input type="checkbox" id="isDeal" checked={formData.isDeal} onChange={(e) => setFormData(prev => ({ ...prev, isDeal: e.target.checked }))} style={{ width: '20px', height: '20px', cursor: 'pointer' }} />
                    <label htmlFor="isDeal" style={{ fontSize: '10px', fontWeight: 800, cursor: 'pointer' }}>FLASH DEAL / CLEARANCE</label>
                 </div>
              </div>
              <div className="admin-grid-2">
                 <div>
                    <label style={{ fontSize: '9px', fontWeight: 800, opacity: 0.4, textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Brand New Price (₦)</label>
                    <input type="number" value={formData.prices?.brandNew} onChange={(e) => setFormData(prev => ({ ...prev, prices: { ...prev.prices, brandNew: Number(e.target.value) } }))} style={{ width: '100%', padding: '16px', border: 'var(--border-thin)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', fontWeight: 800, borderRadius: '2px' }} />
                 </div>
                 <div>
                    <label style={{ fontSize: '9px', fontWeight: 800, opacity: 0.4, textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>UK Used Price (₦)</label>
                    <input type="number" value={formData.prices?.ukUsed} onChange={(e) => setFormData(prev => ({ ...prev, prices: { ...prev.prices, ukUsed: Number(e.target.value) } }))} style={{ width: '100%', padding: '16px', border: 'var(--border-thin)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', fontWeight: 800, borderRadius: '2px' }} />
                 </div>
              </div>
              <div>
                 <label style={{ fontSize: '9px', fontWeight: 800, opacity: 0.4, textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Stock Count</label>
                 <input type="number" min="0" value={formData.stock} onChange={(e) => setFormData(prev => ({ ...prev, stock: Number(e.target.value) }))} style={{ width: '100%', padding: '16px', border: 'var(--border-thin)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', fontWeight: 800, borderRadius: '2px' }} />
              </div>
              <div>
                  <label style={{ fontSize: '9px', fontWeight: 800, opacity: 0.4, textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Aesthetic Palette (Colors, comma separated)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Space Black, Deep Purple, Silver" 
                    value={formData.colors?.join(', ') || ''} 
                    onChange={(e) => setFormData(prev => ({ ...prev, colors: e.target.value.split(',').map(c => c.trim()).filter(c => c !== '') }))} 
                    style={{ width: '100%', padding: '16px', border: 'var(--border-thin)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', fontWeight: 800, borderRadius: '2px' }} 
                  />
               </div>
              <div>
                <label style={{ fontSize: '9px', fontWeight: 800, opacity: 0.4, textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Elite Formatting Description</label>
                <textarea 
                  value={formData.description || ''} 
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} 
                  placeholder="Draft the elite value proposition..."
                  style={{ 
                    width: '100%', 
                    padding: '16px', 
                    border: 'var(--border-thin)', 
                    backgroundColor: 'var(--bg-secondary)', 
                    color: 'var(--text-primary)', 
                    fontWeight: 800,
                    minHeight: '200px',
                    resize: 'vertical',
                    fontSize: '14px',
                    lineHeight: '1.6',
                    borderRadius: '2px'
                  }} 
                />
              </div>
            </div>

            {/* Right: Media & Specs */}
            <div style={{ display: 'grid', gap: '32px' }}>
              <div>
                <label style={{ fontSize: '9px', fontWeight: 800, opacity: 0.4, textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Product Images (gallery)</label>
                <p style={{ fontSize: '10px', opacity: 0.45, marginBottom: '12px' }}>Up to {MAX_GALLERY_IMAGES} images, 8MB each. First image is the cover (shop grids). Use “Cover” to reorder.</p>
                <div style={{ height: '200px', border: 'var(--border-thin)', backgroundColor: 'var(--bg-secondary)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)', borderRadius: '2px', marginBottom: '16px' }}>
                   {formData.images?.length ? (
                     <img src={formData.images[0]} alt="" style={{ height: '100%', width: '100%', objectFit: 'contain', padding: '16px', filter: 'grayscale(1)' }} />
                   ) : (
                     <Camera size={32} style={{ opacity: 0.2 }} />
                   )}
                   <input disabled={isUploading} type="file" accept="image/*" multiple onChange={handleImagesUpload} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
                   {isUploading && (
                     <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 800 }}>UPLOADING...</div>
                   )}
                </div>
                {(formData.images || []).length > 0 && (
                  <div style={{ display: 'grid', gap: '8px', marginBottom: '8px' }}>
                    {(formData.images || []).map((url, idx) => (
                      <div key={`${url}-${idx}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', border: 'var(--border-thin)', borderRadius: '2px', backgroundColor: 'var(--bg-secondary)' }}>
                        <img src={url} alt="" style={{ width: '48px', height: '48px', objectFit: 'contain', borderRadius: '2px', border: idx === 0 ? '2px solid var(--brand-blue)' : '1px solid rgba(128,128,128,0.3)' }} />
                        <span style={{ flex: 1, fontSize: '9px', opacity: 0.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{idx === 0 ? 'Cover' : `Image ${idx + 1}`}</span>
                        {idx > 0 && (
                          <button type="button" onClick={() => setCoverImage(idx)} style={{ padding: '6px 10px', fontSize: '8px', fontWeight: 800, border: 'var(--border-thin)', cursor: 'pointer' }}>Cover</button>
                        )}
                        <button type="button" onClick={() => removeGalleryImage(idx)} style={{ padding: '6px', color: '#FF3B3B', cursor: 'pointer' }} aria-label="Remove image"><Trash2 size={14} /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label style={{ fontSize: '9px', fontWeight: 800, opacity: 0.4, textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Technical Specs</label>
                <div className="admin-grid-specs">
                   <input placeholder="Key (e.g. RAM)" value={specKey} onChange={(e) => setSpecKey(e.target.value)} style={{ padding: '12px', border: 'var(--border-thin)', backgroundColor: 'var(--bg-secondary)', fontSize: '11px', fontWeight: 800, color: 'var(--text-primary)', borderRadius: '2px' }} />
                   <input placeholder="Value (e.g. 16GB)" value={specValue} onChange={(e) => setSpecValue(e.target.value)} style={{ padding: '12px', border: 'var(--border-thin)', backgroundColor: 'var(--bg-secondary)', fontSize: '11px', fontWeight: 800, color: 'var(--text-primary)', borderRadius: '2px' }} />
                   <button type="button" onClick={addSpec} style={{ border: 'var(--border-thin)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)', borderRadius: '2px' }}><Plus size={16} /></button>
                </div>
                <div style={{ display: 'grid', gap: '8px' }}>
                   {formData.specs && Object.entries(formData.specs).map(([k, v]) => (
                     <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', border: 'var(--border-thin)', fontSize: '10px', fontWeight: 800, borderRadius: '2px' }}>
                        <span>{k}: {v}</span>
                        <button onClick={() => removeSpec(k)} type="button" style={{ borderRadius: '2px' }}><Trash2 size={12} /></button>
                     </div>
                   ))}
                </div>
              </div>
            </div>
          </div>

          <button type="submit" style={{ marginTop: '64px', width: '100%', padding: '24px', backgroundColor: 'var(--brand-blue)', color: '#FFFFFF', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.2em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', borderRadius: '2px' }}>
            <Save size={18} /> {product ? "UPDATE GLOBAL INVENTORY" : "ADD TO GLOBAL INVENTORY"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProductFormModal;
