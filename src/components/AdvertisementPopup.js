import React, { useState, useEffect } from "react";
import "./AdvertisementPopup.css";

const AdvertisementPopup = ({ onClose }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const showTimer = setTimeout(() => setVisible(true), 100); // Delay to trigger transition
    // Auto-close after a short delay so the popup doesn't permanently block the login UI
    const autoCloseTimer = setTimeout(() => {
      if (onClose) onClose();
    }, 2500);

    const onKey = (e) => {
      if (e.key === "Escape") {
        if (onClose) onClose();
      }
    };
    window.addEventListener("keydown", onKey);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(autoCloseTimer);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div className={`popup-overlay ${visible ? "popup-visible" : ""}`}>
      <div className="popup-content">
        <h2>Stay Fit and Healthy!</h2>
        <p>
          Discover the best exercises and nutrition tips to maintain your
          health.
        </p>
        <img
          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR-dxsiCbvSD8xp7X1uu5NxPF-0g2jvKWeXuw&s"
          alt="Fitness Advertisement"
          className="popup-image"
        />
        <button
          className="popup-close-button"
          onClick={() => {
            console.log("Close button clicked"); // Debug log
            if (onClose) {
              console.log("Triggering onClose callback"); // Debug log
              onClose();
            } else {
              console.error("onClose callback is not defined"); // Error log
            }
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default AdvertisementPopup;
