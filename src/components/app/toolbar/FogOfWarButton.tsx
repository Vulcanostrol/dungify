import IconButton from "@/components/app/toolbar/IconButton";
import React from "react";

type Props = {
  isActive: boolean,
  onClick: () => void,
};

export default function FogOfWarButton({isActive, onClick}: Props) {
  return (
    <IconButton isActive={isActive} onClick={onClick}>
      <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" fill="currentColor" className="bi bi-cloud-fog2-fill" viewBox="-4 -4 24 24">
        <path d="M8.5 3a5.001 5.001 0 0 1 4.905 4.027A3 3 0 0 1 13 13h-1.5a.5.5 0 0 0 0-1H1.05a3.51 3.51 0 0 1-.713-1H9.5a.5.5 0 0 0 0-1H.035a3.53 3.53 0 0 1 0-1H7.5a.5.5 0 0 0 0-1H.337a3.5 3.5 0 0 1 3.57-1.977A5.001 5.001 0 0 1 8.5 3z"/>
      </svg>
    </IconButton>
  );
}