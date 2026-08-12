import './ContactPage.css';

const ContactPage = () => {
  const contacts = [
    {
      name: 'Ismail Shaikh',
      mobile: '9860651747',
      image: '/images/WhatsApp Image 2025-08-02 at 22.09.58_95020753.jpg',
    },
    {
      name: 'Irfan Shaikh',
      mobile: '8605020914',
      image: '/images/WhatsApp Image 2025-08-02 at 22.16.17_cbc79e07.jpg',
    },
    {
      name: 'Afridi Shaikh',
      mobile: '7083027874',
      image: '/images/WhatsApp Image 2025-11-24 at 12.49.39_87c09ded.jpg',
    },
  ];

  return (
    <div className="contact-page">
      {/* Contact Section */}
      <section className="contact-section">
        <h2>Contact Details</h2>
        <p className="contact-intro">
          Get in touch with our team for business inquiries, partnerships, or any questions about our products.
        </p>

        <div className="contact-cards">
          {contacts.map((contact, index) => (
            <div key={index} className="contact-card">
              <img src={contact.image} alt={contact.name} />
              <div className="contact-info">
                <h3>{contact.name}</h3>
                <p>
                  <span className="label">Mobile No.:</span> 
                  <a href={`tel:${contact.mobile}`}>{contact.mobile}</a>
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="contact-footer">
        <p>&copy; {new Date().getFullYear()} Golden Agro Foods. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default ContactPage;
