import React from 'react';
import './AnnouncementBar.css';

const AnnouncementBar = () => {
  return (
    <div className="announcement-bar">
      <div className="container">
        <div className="announcement-content">
          <span className="announcement-text">
            Free shipping on orders above ₹999 • Supporting Indian Artisans
          </span>
          <div className="announcement-links hide-mobile">
            <a href="/track-order" className="announcement-link">Track Order</a>
            <span className="separator">|</span>
            <a href="/contact" className="announcement-link">Help & Support</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementBar;
