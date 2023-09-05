import styles from "./layers/LayerMenu.module.css";
import IconButton from "@/components/app/toolbar/IconButton";

type Props = {
  isActive: boolean;
  onClick: () => void;
};

export default function LockButton({isActive, onClick}: Props) {
  return (
    <IconButton isActive={isActive} onClick={onClick}>
      <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" fill="currentColor" className={`${styles.layer_lock} bi bi-lock-fill`} viewBox="-4 -4 24 24">
        <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/>
      </svg>
    </IconButton>
  );
}