import React, { useEffect } from "react";
import "./alertModal.css";

const ICONS = {
  success: (
    <svg className="alert-modal__icon" viewBox="0 0 52 52">
      <circle className="alert-modal__icon-circle alert-modal__icon-circle--success" cx="26" cy="26" r="25" fill="none" />
      <path className="alert-modal__icon-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
    </svg>
  ),
  error: (
    <svg className="alert-modal__icon" viewBox="0 0 52 52">
      <circle className="alert-modal__icon-circle alert-modal__icon-circle--error" cx="26" cy="26" r="25" fill="none" />
      <path className="alert-modal__icon-cross" fill="none" d="M16 16 36 36M36 16 16 36" />
    </svg>
  ),
  info: (
    <svg className="alert-modal__icon" viewBox="0 0 52 52">
      <circle className="alert-modal__icon-circle alert-modal__icon-circle--info" cx="26" cy="26" r="25" fill="none" />
      <text x="26" y="35" textAnchor="middle" className="alert-modal__icon-info-text">i</text>
    </svg>
  ),
  warning: (
    <svg className="alert-modal__icon" viewBox="0 0 52 52">
      <circle className="alert-modal__icon-circle alert-modal__icon-circle--warning" cx="26" cy="26" r="25" fill="none" />
      <text x="26" y="35" textAnchor="middle" className="alert-modal__icon-warn-text">!</text>
    </svg>
  ),
};

const AlertModal = ({ isOpen, onClose, title, message, type = "info", buttonText = "OK" }) => {
  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="alert-modal__overlay" onClick={onClose}>
      <div className="alert-modal__container" onClick={(e) => e.stopPropagation()}>
        <div className="alert-modal__icon-wrapper">
          {ICONS[type] || ICONS.info}
        </div>
        {title && <h3 className={`alert-modal__title alert-modal__title--${type}`}>{title}</h3>}
        <p className="alert-modal__message">{message}</p>
        <button
          className={`alert-modal__btn alert-modal__btn--${type}`}
          onClick={onClose}
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
};

export default AlertModal;
