import React from "react";
import {Identifier, LayerObjectTypes} from "@/types";
import {useSelf, useStorage} from "liveblocks.config";
import TokenObject from "@/components/app/TokenObject";

type Props = {
  objectId: Identifier,
  opacity: number,
};

export default function Object(props: Props) {
  const object = useStorage((root) => root.objects.get(props.objectId));
  const selectedBySelf = useSelf((me) => me.presence.selection === props.objectId);
  if (!object) return null;
  const {x, y, width, height} = object;
  switch (object.type) {
    case LayerObjectTypes.Rectangle:
      return <rect
        x={0}
        y={0}
        width={width}
        height={height}
        fill="red"
        opacity={props.opacity}
        style={{
          transform: `translate(${x}px, ${y}px)`,
          transition: selectedBySelf ? "none" : "transform 120ms ease-in-out",
        }}
      />;
    case LayerObjectTypes.Token:
      return <TokenObject
        x={x}
        y={y}
        width={width}
        height={height}
        object={object}
        objectId={props.objectId}
        selectedBySelf={selectedBySelf}
        opacity={props.opacity}
      />;
    default:
      return null;
  }
}