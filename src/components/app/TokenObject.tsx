import React from "react";
import {Identifier, LayerType} from "@/types";
import {useSelf, useStorage} from "liveblocks.config";

type Props = {
  objectId: Identifier,
};

export default function TokenObject({objectId}: Props) {
  const object = useStorage((root) => root.objects.get(objectId));
  const selectedBySelf = useSelf((me) => me.presence.selection === objectId);
  if (!object) return null;
  const {x, y, width, height} = object;
  switch (object.type) {
    case LayerType.Rectangle:
      return <rect
        x={0}
        y={0}
        width={width}
        height={height}
        fill="red"
        style={{
          transform: `translate(${x}px, ${y}px)`,
          transition: selectedBySelf ? "none" : "transform 120ms ease-in-out",
        }}
      />;
    case LayerType.Token:
      return <image
        x={0}
        y={0}
        width={width}
        height={height}
        href={object.href}
        style={{
          transform: `translate(${x}px, ${y}px)`,
          transition: selectedBySelf ? "none" : "transform 120ms ease-in-out",
        }}
        preserveAspectRatio="none"
      />;
    default:
      return null;
  }
}