import {LiveList, LiveObject} from "@liveblocks/client";

export type Color = {
  r: number,
  g: number,
  b: number,
};

export enum CursorState {
  HIDDEN,
  SHOWN,
}

/*
 * Layer types
 */

export enum LayerObjectTypes {
  Rectangle,
  Token,
}

export type RectangleLayerObject = {
  type: LayerObjectTypes.Rectangle,
  x: number,
  y: number,
  height: number,
  width: number,
  fill: Color,
};

export type TokenLayerObject = {
  type: LayerObjectTypes.Token,
  x: number,
  y: number,
  height: number,
  width: number,
  href: string,
  key: string,
};

export type Identifier = string;

export type LayerObject = RectangleLayerObject | TokenLayerObject;

export type DmLayerBoundary = LiveObject<{
  type: "DM_BOUNDARY",
  locked: boolean,
}>;

export type Layer = LiveObject<{
  type: "LAYER",
  name: string,
  locked: boolean,
  object: Identifier,
}>;

export type LayerGroup = LiveObject<{
  type: "GROUP",
  name: string,
  id: Identifier,
  locked: boolean,
  layers: LayerListType,
}>;

export type LayerType = Layer | LayerGroup | DmLayerBoundary;

export type LayerListType = LiveList<LayerType>;

export type Point = {
  x: number,
  y: number,
};

/** The camera is the point at the top-left of the user's screen. */
export type Camera = {
  /** The distance along the x-axis from x=0 to the left side of the user's screen. */
  x: number,
  /** The distance along the y-axis from y=0 to the top of the user's screen. */
  y: number,
  /** Zoom multiplier, zoom > 1 means the user is zoomed out, zoom < 1 means the user is zoomed in. */
  zoom: number,
};

export type XYWH = {
  x: number,
  y: number,
  width: number,
  height: number,
};

export type Dimensions = {
  width: number,
  height: number,
};

export type Region = Array<[
  number,
  number,
]>;

export type Polygon = {
  regions: Array<Region>,
  inverted: boolean,
}

export enum Side {
  Top = 1,
  Bottom = 2,
  Left = 4,
  Right = 8,
}

export type CanvasState = {
  mode: CanvasMode.None,
} | {
  mode: CanvasMode.Inserting,
} | {
  mode: CanvasMode.Panning,
  current: Point,
} | {
  mode: CanvasMode.Translating,
  current: Point,
} | {
  mode: CanvasMode.Resizing,
  initialBounds: XYWH,
  corner: Side,
} | {
  mode: CanvasMode.FogOfWar,
  region: Region,
};

export enum CanvasMode {
  None,
  Inserting,
  Panning,
  Translating,
  Resizing,
  FogOfWar,
}
