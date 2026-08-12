import './ProductsShowcase.css';

const ProductsShowcase = () => {
  const productImages = [
    { src: '/images/WhatsApp Image 2025-08-02 at 21.40.35_897a7645.jpg', alt: 'Product 1' },
    { src: '/images/WhatsApp Image 2025-08-02 at 21.40.35_6488a4fe.jpg', alt: 'Product 2' },
    { src: '/images/WhatsApp Image 2025-08-02 at 21.40.35_cacfa664.jpg', alt: 'Product 3' },
    { src: '/images/WhatsApp Image 2025-08-02 at 21.40.36_aa66bb75.jpg', alt: 'Product 4' },
    { src: '/images/WhatsApp Image 2025-08-02 at 21.40.37_ec405cb6.jpg', alt: 'Product 5' },
  ];

  return (
    <div className="products-showcase-page">
      {/* Products Section */}
      <section className="showcase-section">
        <h3>Best Selling Product</h3>

        {/* Highlighted product */}
        <div className="highlight-product">
          <img 
            src="/images/WhatsApp Image 2025-08-02 at 21.40.36_df506be4.jpg" 
            alt="Best Product" 
          />
        </div>

        {/* Product grid */}
        <div className="products-grid">
          {productImages.map((image, index) => (
            <img key={index} src={image.src} alt={image.alt} />
          ))}
        </div>

        {/* Another highlighted product */}
        <div className="highlight-product">
          <img 
            src="/images/WhatsApp Image 2025-08-02 at 21.40.36_0a675905.jpg" 
            alt="Featured Product" 
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="showcase-footer">
        <p>&copy; {new Date().getFullYear()} Golden Agro Foods. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default ProductsShowcase;
