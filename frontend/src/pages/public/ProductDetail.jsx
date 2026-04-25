import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api, { toAssetUrl } from '../../api/api';
import Navbar from '../../components/Navbar';
import '../products.css';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const response = await api.get(`/products/${id}`);
        setProduct(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Khong the tai chi tiet san pham');
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  return (
    <div className="products-page">
      <Navbar />

      <main className="products-shell detail-shell">
        <Link to="/products" className="back-link">
          Quay lai danh sach
        </Link>

        {loading && <p className="products-info">Dang tai chi tiet san pham...</p>}
        {error && <p className="products-error">{error}</p>}

        {!loading && !error && product && (
          <section className="product-detail-card">
            <div className="detail-image-wrap">
              {product.image ? (
                <img src={toAssetUrl(product.image)} alt={product.name} />
              ) : (
                <div className="product-image-empty">Khong co anh</div>
              )}
            </div>

            <div className="detail-content">
              <p className="category-pill">{product.category || 'Chua phan loai'}</p>
              <h1>{product.name}</h1>
              <p className="detail-price">{Number(product.price).toLocaleString('vi-VN')} VND</p>

              <div className="detail-meta-row">
                <span>Ton kho: {product.quantity ?? 0}</span>
                <span className={`status-badge ${product.status === 'ACTIVE' ? 'active' : 'inactive'}`}>
                  {product.status === 'ACTIVE' ? 'Con hang' : 'Het hang'}
                </span>
              </div>

              <p className="detail-description">{product.description || 'San pham hien chua co mo ta.'}</p>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default ProductDetail;
