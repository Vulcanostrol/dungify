import {
  Color,
  Side,
  LayerObjectTypes,
  Point,
  XYWH,
  Camera, LayerObject, LayerGroup, Layer, Identifier, LayerType,
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
  ignoreLockedLayers: boolean = true,
  dungeonMaster: boolean = false,
): Identifier | null {
  const filteredList = ignoreLockedLayers ? layerGroupToLayerList(group, dungeonMaster).filter(({layer}) => !layer.locked) : layerGroupToLayerList(group);
  const objectList = filteredList.map<Identifier>(({layer}) => layer.object);
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
    case LayerObjectTypes.Rectangle:
      return isHittingRectangle(layerObject, point);
    case LayerObjectTypes.Token:
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
  dungeonMasterMode = false,
  passedDmBoundary = false,
): Array<{layer: ToImmutable<Layer>, dm: boolean}> {
  const result: Array<{layer: ToImmutable<Layer>, dm: boolean}> = [];
  let passedDmLayerBoundary = false;
  group.layers.forEach((layer: ToImmutable<LayerType>) => {
    if (dungeonMasterMode || !passedDmLayerBoundary) {
      if (layer.type === "LAYER") {
        result.push({layer, dm: passedDmLayerBoundary});
      } else if (layer.type === "DM_BOUNDARY") {
        passedDmLayerBoundary = true;
      } else if (layer.type === "GROUP") {
        result.push(...layerGroupToLayerList(layer, dungeonMasterMode, passedDmBoundary));
      }
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
