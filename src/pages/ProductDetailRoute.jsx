import React, { useMemo } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import ProductDetail from './ProductDetail';
import { findProductFromPathParam } from '../utils/productPath';
import EliteLoader from '../components/ui/EliteLoader';

const ProductDetailRoute = ({ appNavigate }) => {
  const { slug } = useParams();
  const { products, loading } = useAppContext();
  const product = useMemo(() => findProductFromPathParam(products, slug), [products, slug]);

  if (loading && products.length === 0) {
    return (
      <div style={{ minHeight: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <EliteLoader />
      </div>
    );
  }

  if (!product) {
    return <Navigate to="/shop" replace />;
  }

  return (
    <ProductDetail
      product={product}
      onBack={() => appNavigate('shop')}
      onNavigate={appNavigate}
    />
  );
};

export default ProductDetailRoute;
