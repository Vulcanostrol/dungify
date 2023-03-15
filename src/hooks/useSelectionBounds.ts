import { useStorage, useSelf } from "../../liveblocks.config";
import {XYWH} from "@/types";
import { shallow } from "@liveblocks/react";

export default function useSelectionBounds() {
  const selection = useSelf((me) => me.presence.selection);
  return useStorage((root): XYWH | null => {
    if (!selection) return null;
    const selectedLayer = root.objects.get(selection);
    if (!selectedLayer) return null;
    return {
      x: selectedLayer.x,
      y: selectedLayer.y,
      width: selectedLayer.width,
      height: selectedLayer.height,
    }
  }, shallow);
}