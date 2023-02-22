import {
  Color,
  Side,
  LayerType,
  Point,
  XYWH,
  Camera, LayerObject, LayerGroup, Layer, Identifier,
} from "./types";
import React from "react";
import {ToImmutable} from "@liveblocks/core";

export function colorToCss(color: Color) {
  return `#${color.r.toString(16).padStart(2, "0")}${color.g
    .toString(16)
    .padStart(2, "0")}${color.b.toString(16).padStart(2, "0")}`;
}

const COLORS = ["#DC2626", "#D97706", "#059669", "#7C3AED", "#DB2777"];

export function connectionIdToColor(connectionId: number): string {
  return COLORS[connectionId % COLORS.length];
}

export function resizeBounds(bounds: XYWH, corner: Side, point: Point): XYWH {
  const result = {
    x: bounds.x,
    y: bounds.y,
    width: bounds.width,
    height: bounds.height,
  };

  if ((corner & Side.Left) === Side.Left) {
    result.x = Math.min(point.x, bounds.x + bounds.width);
    result.width = Math.abs(bounds.x + bounds.width - point.x);
  }

  if ((corner & Side.Right) === Side.Right) {
    result.x = Math.min(point.x, bounds.x);
    result.width = Math.abs(point.x - bounds.x);
  }

  if ((corner & Side.Top) === Side.Top) {
    result.y = Math.min(point.y, bounds.y + bounds.height);
    result.height = Math.abs(bounds.y + bounds.height - point.y);
  }

  if ((corner & Side.Bottom) === Side.Bottom) {
    result.y = Math.min(point.y, bounds.y);
    result.height = Math.abs(point.y - bounds.y);
  }

  return result;
}

export function testPointForLayer(
  group: ToImmutable<LayerGroup>,
  objects: ReadonlyMap<Identifier, LayerObject>,
  point: Point,
): Identifier | null {
  const objectList = layerGroupToLayerList(group).map<Identifier>((layer) => layer.object);
  return findIntersectingObjectWithPoint(objectList, objects, point);
}

export function findIntersectingObjectWithPoint(
  objectIds: Array<Identifier>,
  objects: ReadonlyMap<Identifier, LayerObject>,
  point: Point
) {
  for (let i = objectIds.length - 1; i >= 0; i--) {
    const objectId = objectIds[i];
    const object = objects.get(objectId);
    if (object && isHittingLayer(object, point)) {
      return objectId;
    }
  }
  return null;
}

export function isHittingLayer(layerObject: LayerObject, point: Point) {
  switch (layerObject.type) {
    case LayerType.Rectangle:
      return isHittingRectangle(layerObject, point);
    case LayerType.Token:
      return isHittingRectangle(layerObject, point);
    default:
      return false;
  }
}

export function isHittingRectangle(layer: XYWH, point: Point) {
  return (
    point.x > layer.x &&
    point.x < layer.x + layer.width &&
    point.y > layer.y &&
    point.y < layer.y + layer.height
  );
}

export function layerGroupToLayerList(
  group: ToImmutable<LayerGroup>,
): Array<ToImmutable<Layer>> {
  const result: Array<ToImmutable<Layer>> = [];
  group.layers.forEach((layer: ToImmutable<Layer> | ToImmutable<LayerGroup>) => {
    if (layer.type === "LAYER") {
      result.push(layer);
    } else {
      result.push(...layerGroupToLayerList(layer));
    }
  });
  return result;
}

export function pointerEventToWorldPoint(
  e: React.PointerEvent | React.WheelEvent,
  camera: Camera,
): Point {
  return {
    x: e.clientX / camera.zoom + camera.x / camera.zoom,
    y: e.clientY / camera.zoom + camera.y / camera.zoom,
  };
}

export function zoomCamera(
  e: React.PointerEvent | React.WheelEvent,
  camera: Camera,
  newZoom: number,
): Camera {
  const zoomMultiplier = newZoom / camera.zoom;
  const newCameraX = zoomMultiplier * (e.clientX + camera.x) - e.clientX;
  const newCameraY = zoomMultiplier * (e.clientY + camera.y) - e.clientY;
  return {
    x: newCameraX,
    y: newCameraY,
    zoom: newZoom,
  };
}
