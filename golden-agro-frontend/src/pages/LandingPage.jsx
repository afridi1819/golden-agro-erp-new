import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './LandingPage.css';

const LandingPage = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({ name: '', email: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name && formData.email) {
      toast.success('Thank you for subscribing!');
      setFormData({ name: '', email: '' });
    } else {
      toast.error('Please fill in all fields');
    }
  };

  return (
    <div className="landing-page">
      {/* Header */}
      <header className="landing-header">
        <div className="header-content">
          <img src="/logo.png" alt="Golden Agro Foods Logo" className="header-logo" />
          <div className="header-text">
            <h1>Golden Agro Foods</h1>
            <p>Refreshing the Nation, Naturally</p>
            <div className="landing-cta">
              {user ? (
                <Link to="/app/dashboard" className="btn-primary">Go to Dashboard</Link>
              ) : (
                <>
                  <Link to="/login" className="btn-primary">Login</Link>
                  <Link to="/register" className="btn-secondary">Register</Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="home" className="landing-section hero-section">
        <h2>Welcome to Golden Agro Foods</h2>
        <p>
          We are a leading manufacturer of premium quality beverages, bringing you the finest 
          cold drinks and refreshments made with natural ingredients and state-of-the-art technology.
        </p>
      </section>

      {/* Cold Drinks Section */}
      <section id="cold-drinks" className="landing-section">
        <h2>Cold Drinks</h2>
        <p>We produce a wide range of refreshing cold drinks including:</p>
        <ul>
          <li><strong>Pio-Mango</strong> – Real mango juice-based drink</li>
          <li><strong>Pio-Lemon Spark</strong> – Zesty lemon soda</li>
          <li><strong>Pio-Orange Rush</strong> – Pulpy orange delight</li>
          <li><strong>Pio-Jeera Soda</strong> – Traditional spiced refreshment</li>
        </ul>
      </section>

      {/* Our Factory Section */}
      <section id="factory" className="landing-section">
        <h2>Our Factory</h2>
        <p>
          Located in the heart of India, our factory is equipped with modern machinery and adheres 
          to strict hygiene standards. We ensure quality control at every stage of production to 
          deliver the best to our customers.
        </p>
        <p>
          Our state-of-the-art facility features automated bottling lines, advanced purification 
          systems, and climate-controlled storage to maintain the highest quality standards.
        </p>
      </section>

      {/* Products Section */}
      <section id="products" className="landing-section">
        <h2>Our Products</h2>
        <p>Besides cold drinks, we also offer:</p>
        <ul>
          <li>Packaged Fruit Juices</li>
          <li>Flavored Mineral Water</li>
          <li>Organic Syrups</li>
          <li>Custom Beverage Solutions for retailers</li>
        </ul>
        {/* You can add product image here */}
        {/* <img src="/product-image.jpg" alt="Golden Agro Product" className="landing-image" /> */}
      </section>

      {/* Newsletter Section */}
      <section id="contact" className="landing-section">
        <form className="landing-form" onSubmit={handleSubmit}>
          <h2>Join for Updates</h2>
          
          <label htmlFor="name">Name</label>
          <input 
            type="text" 
            id="name" 
            name="name" 
            placeholder="Enter your name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />

          <label htmlFor="email">Email</label>
          <input 
            type="email" 
            id="email" 
            name="email" 
            placeholder="Enter your email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />

          <button type="submit">Subscribe</button>
        </form>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <p>&copy; {new Date().getFullYear()} Golden Agro Foods. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
