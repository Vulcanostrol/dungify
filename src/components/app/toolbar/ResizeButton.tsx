import IconButton from "@/components/app/toolbar/IconButton";

type Props = {
  isActive: boolean;
  onClick: () => void;
};

export default function ResizeButton({isActive, onClick}: Props) {
  return (
    <IconButton isActive={isActive} onClick={onClick}>
      <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" fill="currentColor" className="bi bi-aspect-ratio-fill" viewBox="-4 -4 24 24">
        <path d="M0 12.5v-9A1.5 1.5 0 0 1 1.5 2h13A1.5 1.5 0 0 1 16 3.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 0 12.5zM2.5 4a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 1 0V5h2.5a.5.5 0 0 0 0-1h-3zm11 8a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-1 0V11h-2.5a.5.5 0 0 0 0 1h3z"/>
      </svg>
    </IconButton>
  );
}