import styles from "./DungifyApp.module.css";
import React, {useEffect, useState} from "react";
import {Camera, CanvasMode, CanvasState, Identifier, Layer, LayerGroup, LayerObject, Point} from "@/types";
import Grid from "@/components/app/Grid";
import {pointerEventToWorldPoint, testPointForLayer, zoomCamera} from "@/utils";
import ImageDropHandler from "@/components/app/ImageDropHandler";
import {useMutation, useStorage} from "liveblocks.config";
import TokenObject from "@/components/app/TokenObject";
import {ToImmutable} from "@liveblocks/core";
import {LiveMap, LiveObject} from "@liveblocks/client";

export default function DungifyApp() {
  const topLevelGroup = useStorage((root) => root.topLevelGroup);

  const [camera, setCamera] = useState<Camera>({x: 0, y: 0, zoom: 1});
  const [canvasState, setCanvasState] = useState<CanvasState>({mode: CanvasMode.None});
  const [pointer, setPointer] = useState<Point>({x: 0, y: 0});

  /*
   * Pointer events.
   */

  const onPointerDown = useMutation(({storage}, e: React.PointerEvent) => {
    if (e.button === 0) {
      const pointInWorld = pointerEventToWorldPoint(e, camera)
      const objects = storage.get("objects").toImmutable();
      const result = testPointForLayer(topLevelGroup, objects, pointInWorld);
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
  }, [camera, setCanvasState]);

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
      const object = objects.get("");
      if (!object) return;
      object.update({x: object.get("x"), y: object.get("y")});
    }
    setMyPresence({
      cursor: {
        x: pointInWorld.x,
        y: pointInWorld.y,
      },
    });
  }, [camera, setCamera, canvasState, setCanvasState, setPointer]);

  const onPointerUp = React.useCallback(() => {
    setCanvasState({
      mode: CanvasMode.None,
    });
  }, [setCanvasState]);

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

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      switch (e.key) {
        case "Backspace": {
          deleteLayers();
          break;
        }
      }
    }

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [deleteLayers]);

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
        >
          <g
            style={{
              transform: `translate(${-camera.x}px, ${-camera.y}px) scale(${camera.zoom})`,
            }}
          >
            {topLevelGroup.layers.map((layer: ToImmutable<Layer> | ToImmutable<LayerGroup>) => {
              const objectId: Identifier = (layer as ToImmutable<Layer>).object;
              return <TokenObject key={objectId} objectId={objectId}/>
            })}
          </g>
          <Grid size={100} camera={camera}/>
        </svg>
        {canvasState.mode === CanvasMode.Inserting &&
        <ImageDropHandler
            onCancel={onDragExit}
            onDone={onDragExit}
        />
        }
      </div>
    </>
  );
}