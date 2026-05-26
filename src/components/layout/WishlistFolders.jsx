import React, { useState } from 'react';
import { Folder, FolderPlus, Share2, Heart, X, Plus } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

const WishlistFolders = ({ isOpen, onClose, product }) => {
  const { wishlist, toggleWishlist, showNotification } = useAppContext();
  const [folders, setFolders] = useState(() => {
    const saved = localStorage.getItem('ifeco-wishlist-folders');
    return saved ? JSON.parse(saved) : [
      { id: 'default', name: 'My Wishlist', products: wishlist.map(p => p.id) }
    ];
  });
  const [newFolderName, setNewFolderName] = useState('');
  const [selectedFolder, setSelectedFolder] = useState('default');
  const [isCreating, setIsCreating] = useState(false);

  React.useEffect(() => {
    localStorage.setItem('ifeco-wishlist-folders', JSON.stringify(folders));
  }, [folders]);

  const createFolder = () => {
    if (!newFolderName.trim()) return;
    const newFolder = {
      id: Date.now().toString(),
      name: newFolderName.trim(),
      products: []
    };
    setFolders([...folders, newFolder]);
    setNewFolderName('');
    setIsCreating(false);
  };

  const addToFolder = () => {
    if (!product) return;
    setFolders(folders.map(folder =>
      folder.id === selectedFolder
        ? { ...folder, products: [...folder.products, product.id] }
        : folder
    ));
    toggleWishlist(product); // Add to main wishlist too
    onClose();
  };

  const shareWishlist = (folderId) => {
    const folder = folders.find(f => f.id === folderId);
    if (!folder) return;

    const shareUrl = `${window.location.origin}/wishlist/shared/${folderId}`;
    navigator.clipboard.writeText(shareUrl);
    showNotification('Wishlist link copied to clipboard!', 'success');
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.8)',
        backdropFilter: 'blur(20px)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px'
      }}
      onClick={onClose}
    >
      <div
        className="modal-content"
        style={{
          width: '100%',
          maxWidth: '500px',
          backgroundColor: 'var(--bg-primary)',
          border: 'var(--border-thin)',
          borderRadius: '8px',
          padding: '32px',
          position: 'relative',
          boxShadow: '0 40px 100px rgba(0,0,0,0.4)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '32px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Heart size={24} color="var(--brand-blue)" />
            <h2 style={{
              fontSize: '18px',
              fontWeight: 800,
              letterSpacing: '0.05em',
              textTransform: 'uppercase'
            }}>
              SAVE TO WISHLIST
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Product Info */}
        {product && (
          <div style={{
            padding: '16px',
            backgroundColor: 'var(--bg-secondary)',
            border: 'var(--border-thin)',
            borderRadius: '4px',
            marginBottom: '24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <img
                src={product.image}
                alt={product.name}
                style={{
                  width: '40px',
                  height: '40px',
                  objectFit: 'contain',
                  borderRadius: '2px'
                }}
              />
              <div>
                <p style={{
                  fontSize: '13px',
                  fontWeight: 800,
                  marginBottom: '2px'
                }}>
                  {product.name}
                </p>
                <p style={{
                  fontSize: '11px',
                  opacity: 0.6
                }}>
                  {product.brand} • {product.category}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Folder Selection */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{
            fontSize: '12px',
            fontWeight: 800,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            marginBottom: '16px',
            opacity: 0.7
          }}>
            SELECT FOLDER
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {folders.map(folder => (
              <label
                key={folder.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  border: 'var(--border-thin)',
                  borderRadius: '2px',
                  cursor: 'pointer',
                  backgroundColor: selectedFolder === folder.id ? 'var(--bg-secondary)' : 'transparent'
                }}
              >
                <input
                  type="radio"
                  name="folder"
                  value={folder.id}
                  checked={selectedFolder === folder.id}
                  onChange={(e) => setSelectedFolder(e.target.value)}
                  style={{ display: 'none' }}
                />
                <Folder size={16} />
                <span style={{
                  fontSize: '13px',
                  fontWeight: 800,
                  flex: 1
                }}>
                  {folder.name}
                </span>
                <span style={{
                  fontSize: '11px',
                  opacity: 0.5
                }}>
                  {folder.products.length} items
                </span>
                {folder.id !== 'default' && (
                  <button
                    onClick={() => shareWishlist(folder.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px',
                      opacity: 0.6
                    }}
                    title="Share wishlist"
                  >
                    <Share2 size={14} />
                  </button>
                )}
              </label>
            ))}
          </div>
        </div>

        {/* Create New Folder */}
        {!isCreating ? (
          <button
            onClick={() => setIsCreating(true)}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: 'var(--bg-secondary)',
              border: 'var(--border-thin)',
              fontSize: '11px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '24px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <FolderPlus size={16} />
            CREATE NEW FOLDER
          </button>
        ) : (
          <div style={{
            padding: '16px',
            backgroundColor: 'var(--bg-secondary)',
            border: 'var(--border-thin)',
            borderRadius: '2px',
            marginBottom: '24px'
          }}>
            <input
              type="text"
              placeholder="Folder name..."
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && createFolder()}
              style={{
                width: '100%',
                padding: '8px',
                border: 'var(--border-thin)',
                backgroundColor: 'var(--bg-primary)',
                fontSize: '13px',
                fontWeight: 800,
                marginBottom: '12px'
              }}
              autoFocus
            />
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={createFolder}
                disabled={!newFolderName.trim()}
                style={{
                  flex: 1,
                  padding: '8px',
                  backgroundColor: 'var(--brand-blue)',
                  color: '#fff',
                  border: 'none',
                  fontSize: '11px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  cursor: 'pointer',
                  opacity: newFolderName.trim() ? 1 : 0.5
                }}
              >
                CREATE
              </button>
              <button
                onClick={() => {
                  setIsCreating(false);
                  setNewFolderName('');
                }}
                style={{
                  padding: '8px 16px',
                  backgroundColor: 'transparent',
                  border: 'var(--border-thin)',
                  fontSize: '11px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  cursor: 'pointer'
                }}
              >
                CANCEL
              </button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={addToFolder}
            style={{
              flex: 1,
              padding: '16px',
              backgroundColor: 'var(--brand-blue)',
              color: '#fff',
              border: 'none',
              fontSize: '11px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              cursor: 'pointer',
              borderRadius: '2px'
            }}
          >
            ADD TO WISHLIST
          </button>
          <button
            onClick={onClose}
            style={{
              padding: '16px 24px',
              backgroundColor: 'transparent',
              border: 'var(--border-thin)',
              fontSize: '11px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              cursor: 'pointer',
              borderRadius: '2px'
            }}
          >
            CANCEL
          </button>
        </div>
      </div>
    </div>
  );
};

export default WishlistFolders;