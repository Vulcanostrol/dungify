import React from "react";
import {Identifier, LayerType} from "@/types";
import {useStorage} from "liveblocks.config";

type Props = {
  objectId: Identifier,
};

export default function TokenObject({objectId}: Props) {
  const object = useStorage((root) => root.objects.get(objectId));
  if (!object) return null;
  const {x, y, width, height} = object;
  switch (object.type) {
    case LayerType.Rectangle:
      return <rect x={x} y={y} width={width} height={height} fill="red"/>;
    case LayerType.Token:
      return <image x={x} y={y} width={width} height={height} href={object.href}/>;
    default:
      return null;
  }
}