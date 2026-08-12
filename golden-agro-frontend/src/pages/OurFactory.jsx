import { useRef } from 'react';
import './OurFactory.css';

const OurFactory = () => {
  const videoRefs = useRef([]);

  const handleMouseEnter = (index) => {
    if (videoRefs.current[index]) {
      videoRefs.current[index].play();
    }
  };

  const handleMouseLeave = (index) => {
    if (videoRefs.current[index]) {
      videoRefs.current[index].pause();
    }
  };

  const factoryVideos = [
    '/videos/WhatsApp Video 2025-08-02 at 22.25.28_b5804c09.mp4',
    '/videos/WhatsApp Video 2025-08-02 at 22.26.26_e1de1a17.mp4',
    '/videos/WhatsApp Video 2025-08-02 at 22.31.20_85ea578d.mp4',
    '/videos/WhatsApp Video 2025-08-02 at 22.31.25_1acb961c.mp4',
    '/videos/WhatsApp Video 2025-08-02 at 22.31.27_4e25b712.mp4',
    '/videos/WhatsApp Video 2025-08-02 at 22.31.39_24de16f5.mp4',
    '/videos/WhatsApp Video 2025-08-02 at 22.31.45_6186bd6a.mp4',
  ];

  return (
    <div className="factory-page">
      {/* Factory Section */}
      <section className="factory-section">
        <h2>Our Factory in Action</h2>
        <p className="factory-description">
          Take a look inside our state-of-the-art manufacturing facility where we produce 
          premium quality beverages with the highest standards of hygiene and quality control.
        </p>
        
        <div className="video-grid">
          {factoryVideos.map((video, index) => (
            <video
              key={index}
              ref={(el) => (videoRefs.current[index] = el)}
              src={video}
              muted
              loop
              playsInline
              onMouseEnter={() => handleMouseEnter(index)}
              onMouseLeave={() => handleMouseLeave(index)}
            />
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="factory-footer">
        <p>&copy; {new Date().getFullYear()} Golden Agro Foods. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default OurFactory;
