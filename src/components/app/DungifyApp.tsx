import styles from "./DungifyApp.module.css";
import React, {useCallback, useEffect, useState} from "react";
import {
  Camera,
  CanvasMode,
  CanvasState,
  CursorState,
  Identifier,
  Layer,
  LayerGroup,
  LayerObject,
  Point, Polygon,
  Side,
  XYWH
} from "@/types";
import Grid from "@/components/app/Grid";
import {pointerEventToWorldPoint, resizeBounds, testPointForLayer, zoomCamera} from "@/utils";
import ImageDropHandler from "@/components/app/ImageDropHandler";
import {useMutation, useSelf, useStorage} from "liveblocks.config";
import TokenObject from "@/components/app/TokenObject";
import {ToImmutable} from "@liveblocks/core";
import {LiveMap, LiveObject} from "@liveblocks/client";
import SelectionBox from "@/components/app/SelectionBox";
import ToolBar from "@/components/app/toolbar/ToolBar";
import FogOfWarLayer from "@/components/app/FogOfWarLayer";
// TODO: Typing might come out for this.
// @ts-ignore
import PolyBool from "polybooljs";

export default function DungifyApp() {
  const topLevelGroup = useStorage((root) => root.topLevelGroup);
  const fogOfWarPolygon = useStorage((root) => root.fogOfWar);
  const selection = useSelf((me) => me.presence.selection);

  const [camera, setCamera] = useState<Camera>({x: 0, y: 0, zoom: 1});
  const [canvasState, setCanvasState] = useState<CanvasState>({mode: CanvasMode.None});
  const [pointer, setPointer] = useState<Point>({x: 0, y: 0});

  const [snapToGrid, setSnapToGrid] = useState<boolean>(false);
  const [showResize, setShowResize] = useState<boolean>(false);

  const [fowOpacity, setFowOpacity] = useState<number>(1.0);

  /*
 * Resizing tokens.
 */

  const onResizeHandlePointerDown = useCallback(
    (corner: Side, initialBounds: XYWH) => {
      setCanvasState({
        mode: CanvasMode.Resizing,
        initialBounds,
        corner,
      });
    },[setCanvasState],
  );

  const resizeSelectedLayer = useMutation(
    ({ storage, self }, point: Point) => {
      if (canvasState.mode !== CanvasMode.Resizing || !self.presence.selection) return;

      const bounds = resizeBounds(
        canvasState.initialBounds,
        canvasState.corner,
        point,
      );

      const objects = storage.get("objects");
      const object = objects.get(self.presence.selection);
      if (object) {
        object.update(bounds);
      }
    },[canvasState],
  );

  /*
   * Pointer events.
   */

  const onPointerDown = useMutation(({storage, setMyPresence}, e: React.PointerEvent) => {
    const pointInWorld = pointerEventToWorldPoint(e, camera)

    if (canvasState.mode === CanvasMode.FogOfWar) {
      canvasState.region.push([pointInWorld.x, pointInWorld.y]);
      return;
    }

    if (e.button === 0) {
      const objects = storage.get("objects").toImmutable();
      const result = testPointForLayer(topLevelGroup, objects, pointInWorld);
      setMyPresence({
        selection: result,
      });
      if (!result) return;
      setCanvasState({
        mode: CanvasMode.Translating,
        current: pointInWorld,
      });
    } else if (e.button === 2)  {
      const pointOnScreen = {x: e.clientX, y: e.clientY};
      setCanvasState({
        mode: CanvasMode.Panning,
        current: pointOnScreen,
      });
    }
  }, [topLevelGroup, camera, canvasState, setCanvasState]);

  const onPointerMove = useMutation(({storage, setMyPresence}, e: React.PointerEvent) => {
    const pointOnScreen = {x: e.clientX, y: e.clientY};
    const pointInWorld = pointerEventToWorldPoint(e, camera);
    setPointer(pointInWorld);
    if (canvasState.mode === CanvasMode.Panning) {
      setCamera({
        ...camera,
        x: camera.x - pointOnScreen.x + canvasState.current.x,
        y: camera.y - pointOnScreen.y + canvasState.current.y,
      });
      setCanvasState({
        mode: CanvasMode.Panning,
        current: pointOnScreen,
      });
    } else if (canvasState.mode === CanvasMode.Translating) {
      const objects = storage.get("objects");
      if (!selection) return;
      const object = objects.get(selection);
      if (!object) return;
      const dx = pointInWorld.x - canvasState.current.x;
      const dy = pointInWorld.y - canvasState.current.y;
      setCanvasState({
        ...canvasState,
        current: pointInWorld,
      });
      object.update({x: object.get("x") + dx, y: object.get("y") + dy});
    } else if (canvasState.mode === CanvasMode.Resizing) {
      resizeSelectedLayer(pointInWorld);
    }
    setMyPresence({
      cursor: {
        x: pointInWorld.x,
        y: pointInWorld.y,
      },
    });
  }, [camera, setCamera, canvasState, setCanvasState, setPointer, selection, resizeSelectedLayer]);

  const onPointerUp = useMutation(() => {
    if (canvasState.mode !== CanvasMode.FogOfWar) {
      setCanvasState({
        mode: CanvasMode.None,
      });
    }
  }, [canvasState, setCanvasState]);

  const onPointerLeave = useMutation(({setMyPresence}) => {
    setMyPresence({
      cursor: null,
    });
  }, []);

  /*
   * Mouse wheel (zoom-) event.
   */

  const onWheel = React.useCallback((e: React.WheelEvent) => {
    const desiredZoom = camera.zoom * (1 - e.deltaY * 0.0005);
    const newZoom = Math.max(Math.min(desiredZoom, 10), 0.1);
    setCamera(zoomCamera(e, camera, newZoom));
  }, [camera, setCamera]);

  /*
   * Context menu (right-click pop-up) event. Simply disables right-click menu.
   */

  const onContextMenu = React.useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  /*
   * Drag-and-drop events.
   */

  const onDragEnter = React.useCallback(() => {
    if (canvasState.mode === CanvasMode.None) {
      setCanvasState({
        mode: CanvasMode.Inserting,
      });
    }
  }, [canvasState, setCanvasState]);

  const onDragExit = React.useCallback(() => {
    if (canvasState.mode === CanvasMode.Inserting) {
      setCanvasState({
        mode: CanvasMode.None,
      });
    }
  }, [canvasState, setCanvasState]);

  /*
   * Keyboard shortcuts.
   */
  const deleteLayers = useMutation(
    ({storage}) => {
      const topLevelGroup = storage.get("topLevelGroup");
      topLevelGroup.get("layers").clear();
      storage.set("objects", new LiveMap<Identifier, LiveObject<LayerObject>>());
    },
    [],
  );

  const switchCursor = useMutation(
    ({self, setMyPresence}) => {
      if (self.presence.state === CursorState.SHOWN) {
        setMyPresence({
          state: CursorState.HIDDEN,
        });
      } else if (self.presence.state === CursorState.HIDDEN) {
        setMyPresence({
          state: CursorState.SHOWN,
        });
      }
    },
    [],
  );

  const switchGridSnap = useMutation(
    () => {
      setSnapToGrid(!snapToGrid);
    },
    [snapToGrid, setSnapToGrid],
  );

  const switchResize = useMutation(
    () => {
      setShowResize(!showResize);
    },
    [showResize, setShowResize],
  );

  const resetFogOfWar = useMutation(({storage}) => {
    storage.get("fogOfWar").update({
      regions: [
        [[0, 0], [0, 5000], [5000, 5000], [5000, 0]],
      ],
      inverted: false,
    });
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "c": {
          switchCursor();
          break;
        }
        case "g": {
          switchGridSnap();
          break;
        }
        case "r": {
          switchResize();
          break;
        }
        case "f": {
          resetFogOfWar();
          break;
        }
      }
    }

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [deleteLayers, switchCursor, switchGridSnap, switchResize, resetFogOfWar]);

  const updateFogOfWar = useMutation(({storage}, polygon: Polygon, adding: boolean) => {
    if (adding) {
      storage.get("fogOfWar").update(PolyBool.union(fogOfWarPolygon, polygon));
    } else {
      storage.get("fogOfWar").update(PolyBool.difference(fogOfWarPolygon, polygon));
    }
  }, [fogOfWarPolygon]);

  return (
    <>
      <div className={styles.canvas}>
        <svg
          className={styles.renderer_svg}
          style={canvasState.mode === CanvasMode.Panning ? {cursor: "grabbing"} : {}}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerLeave}
          onWheel={onWheel}
          onContextMenu={onContextMenu}
          onDragEnter={onDragEnter}
          preserveAspectRatio="none"
        >
          <Grid size={100} camera={camera}/>
          <g
            style={{
              transform: `translate(${-camera.x}px, ${-camera.y}px) scale(${camera.zoom})`,
            }}
          >
            {topLevelGroup.layers.map((layer: ToImmutable<Layer> | ToImmutable<LayerGroup>) => {
              const objectId: Identifier = (layer as ToImmutable<Layer>).object;
              return <TokenObject key={objectId} objectId={objectId}/>
            })}
            {showResize && <SelectionBox
                onResizeHandlePointerDown={onResizeHandlePointerDown}
            />}
            <FogOfWarLayer
              polygon={fogOfWarPolygon}
              fowOpacity={fowOpacity}
            />
          </g>
        </svg>
        {canvasState.mode === CanvasMode.Inserting &&
        <ImageDropHandler
            onCancel={onDragExit}
            onDone={onDragExit}
        />
        }
        <ToolBar
          snapToGrid={snapToGrid}
          switchSnapToGrid={switchGridSnap}
          showResize={showResize}
          switchShowResize={switchResize}
          canvasState={canvasState}
          setCanvasState={setCanvasState}
          updateFogOfWar={updateFogOfWar}
          fowOpacity={fowOpacity}
          setFowOpacity={setFowOpacity}
        />
      </div>
    </>
  );
}