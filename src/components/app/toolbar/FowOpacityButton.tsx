import IconButton from "@/components/app/toolbar/IconButton";
import React from "react";

type Props = {
  isActive: boolean,
  onClick: () => void,
};

export default function FowOpacityButton({isActive, onClick}: Props) {
  return (
    <IconButton isActive={isActive} onClick={onClick}>
      <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" fill="currentColor" className="bi bi-eye-fill" viewBox="-4 -4 24 24">
        <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"/>
        <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/>
      </svg>
    </IconButton>
  );
}