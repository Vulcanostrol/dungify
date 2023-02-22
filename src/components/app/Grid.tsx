import {Camera} from "@/types";

type Props = {
  size: number,
  camera: Camera,
}

export default function Grid({size, camera}: Props) {
  return (
    <>
      <defs>
        <pattern x={-camera.x} y={-camera.y} id="grid" width={size * camera.zoom} height={size * camera.zoom} patternUnits="userSpaceOnUse">
          <path d={`M ${size * camera.zoom} 0 L 0 0 0 ${size * camera.zoom}`} fill="none" stroke="gray" strokeWidth="1"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
    </>
  );
}