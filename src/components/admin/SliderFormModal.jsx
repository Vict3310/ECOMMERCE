import React, { useState, useEffect } from 'react';
import { Save, X, Camera } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { supabase } from '../../supabase';
import { compressImageFile } from '../../utils/compressImage';

const SliderFormModal = ({ isOpen, onClose, selectedItem = null, type = 'hero' }) => {
  const { showNotification } = useAppContext();
  const [formData, setFormData] = useState({});
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (selectedItem) {
      setFormData(selectedItem);
    } else {
      if (type === 'hero') {
        setFormData({ title: '', subtitle: '', image: '', link: 'Phones' });
      } else {
        setFormData({ title: '', image: '', category: 'Phones' });
      }
    }
  }, [selectedItem, isOpen, type]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const prepared = await compressImageFile(file);
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.jpg`;
      const { error: uploadError } = await supabase.storage.from('site-assets').upload(fileName, prepared);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('site-assets').getPublicUrl(fileName);
      setFormData(prev => ({ ...prev, image: publicUrl }));
    } catch (error) {
      console.warn("Storage upload failed.", error);
      showNotification("Image upload failed.", 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const dbKey = type === 'hero' ? 'heroSlides' : 'feedItems';
      
      const { data } = await supabase.from('site_settings').select('value').eq('key', dbKey).single();
      let currentArray = data?.value || [];

      if (selectedItem?.id) {
        // Update existing
        const { id: _id, ...dataToSave } = formData;
        currentArray = currentArray.map(item => item.id === selectedItem.id ? { id: item.id, ...dataToSave } : item);
      } else {
        // Create new
        const newItem = { ...formData, id: Date.now().toString() };
        currentArray.push(newItem);
      }

      const { error } = await supabase.from('site_settings').upsert({ key: dbKey, value: currentArray });
      if (error) throw error;
      
      onClose();
    } catch (error) {
      console.error("Database Error Details:", error);
      showNotification(`Save failed: ${error.message || 'Unknown error'}`, 'error');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-wrapper-mobile" style={{ position: 'fixed', inset: 0, zIndex: 10000, backgroundColor: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(20px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div className="fade-in modal-content-mobile hide-scrollbar" style={{ width: '100%', maxWidth: '900px', backgroundColor: 'var(--bg-primary)', border: 'var(--border-thin)', maxHeight: '90vh', overflowY: 'auto', position: 'relative', boxShadow: '0 40px 100px rgba(0,0,0,0.8)' }}>
        <div className="thin-border-bottom mobile-p-24" style={{ padding: '32px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, backgroundColor: 'var(--bg-primary)', zIndex: 10 }}>
           <h2 style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.2em', color: 'var(--text-primary)' }}>
             {selectedItem ? `EDIT ${type.toUpperCase()}` : `NEW ${type.toUpperCase()}`}
           </h2>
           <button onClick={onClose} style={{ color: 'var(--text-primary)' }}><X size={20} /></button>
        </div>

        <form onSubmit={handleSave} style={{ padding: '48px', display: 'grid', gap: '32px' }}>
          
          <div>
            <label style={{ fontSize: '9px', fontWeight: 800, opacity: 0.4, textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Display Title</label>
            <input required type="text" value={formData.title || ''} onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))} style={{ width: '100%', padding: '16px', border: 'var(--border-thin)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', fontWeight: 800 }} />
          </div>

          {type === 'hero' && (
            <div>
              <label style={{ fontSize: '9px', fontWeight: 800, opacity: 0.4, textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Subtitle</label>
              <input type="text" value={formData.subtitle || ''} onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))} style={{ width: '100%', padding: '16px', border: 'var(--border-thin)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', fontWeight: 800 }} />
            </div>
          )}

          <div>
            <label style={{ fontSize: '9px', fontWeight: 800, opacity: 0.4, textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Link / Category Mapping</label>
            <select value={formData.link || formData.category || 'Phones'} onChange={(e) => setFormData(prev => ({ ...prev, [type === 'hero' ? 'link' : 'category']: e.target.value }))} style={{ width: '100%', padding: '16px', border: 'var(--border-thin)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', fontWeight: 800 }}>
               <option value="Phones">Phones</option>
               <option value="Laptops">Laptops</option>
               <option value="Accessories">Accessories</option>
               <option value="all">All / Shop</option>
            </select>
          </div>

          <div>
             <label style={{ fontSize: '9px', fontWeight: 800, opacity: 0.4, textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Carousel Image</label>
             <div style={{ height: '200px', border: 'var(--border-thin)', backgroundColor: 'var(--bg-secondary)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)' }}>
                {formData.image ? (
                  <img src={formData.image} style={{ height: '100%', width: '100%', objectFit: 'cover', filter: 'grayscale(1)' }} />
                ) : (
                  <Camera size={32} style={{ opacity: 0.2 }} />
                )}
                <input disabled={isUploading} type="file" onChange={handleImageUpload} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
                {isUploading && (
                  <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 800 }}>UPLOADING...</div>
                )}
             </div>
          </div>

          <button type="submit" style={{ marginTop: '24px', width: '100%', padding: '24px', backgroundColor: 'var(--brand-blue)', color: '#FFFFFF', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.2em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
            <Save size={18} /> SAVE CAROUSEL STATE
          </button>
        </form>
      </div>
    </div>
  );
};

export default SliderFormModal;
