import React, { useEffect, useState } from "react";
import { FiAlertTriangle, FiX } from "react-icons/fi";
import "./errorBanner.css";

const ErrorBanner = ({ message, onClose }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setVisible(true);
    }
  }, [message]);

  if (!message || !visible) return null;

  const handleClose = () => {
    setVisible(false);
    if (onClose) onClose();
  };

  return (
    <div className="error-banner">
      <div className="error-banner__content">
        <FiAlertTriangle className="error-banner__icon" />
        <span className="error-banner__text">{message}</span>
        <button className="error-banner__close" onClick={handleClose} aria-label="Close">
          <FiX />
        </button>
      </div>
    </div>
  );
};

export default ErrorBanner;
