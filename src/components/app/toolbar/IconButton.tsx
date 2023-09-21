import styles from "./IconButton.module.css";
import React from "react";

type Props = {
  onClick: () => void;
  children: React.ReactNode;
  isActive?: boolean;
  disabled?: boolean;
  className?: string;
};

export default function IconButton({onClick, children, isActive, disabled, className}: Props) {
  return (
    <button
      className={`${styles.button} ${isActive ? styles.button_active : ""} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}