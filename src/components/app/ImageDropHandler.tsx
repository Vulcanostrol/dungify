import styles from "./ImageDropHandler.module.css";
import React from "react";
import {preSignedImageLocationFromKey, uploadImageToCloud} from "@/cloud";
import {useMutation} from "liveblocks.config";
import {LayerObject, LayerType} from "@/types";
import {nanoid} from "nanoid";
import {LiveObject} from "@liveblocks/client";

type Props = {
  onCancel?: (e: React.DragEvent) => void,
  onDone?: (e: React.DragEvent) => void,
}

export default function ImageDropHandler({onCancel, onDone}: Props) {

  const insertLayer = useMutation(
    ({storage}, imageLocation: string, width: number, height: number) => {
      const objectMap = storage.get("objects");
      const topLevelGroup = storage.get("topLevelGroup");
      const objectId = nanoid();
      const object = new LiveObject<LayerObject>({
        type: LayerType.Token,
        x: 0,
        y: 0,
        href: imageLocation,
        width,
        height,
      });
      topLevelGroup.get("layers").push(new LiveObject({
        type: "LAYER",
        name: "Layer",
        object: objectId,
      }));
      objectMap.set(objectId, object);
    },
    [],
  );

  /*
   * Drag-and-drop events.
   */

  const onDragOver = React.useCallback((e: React.DragEvent) => {
    e.preventDefault(); // Prevents opening image file in new window.
  }, []);

  const onDragExit = React.useCallback((e: React.DragEvent) => {
    if (onCancel) onCancel(e);
  }, [onCancel]);

  const onDrop = useMutation( async ({}, e: React.DragEvent) => {
    // Catches event where file is dropped in window.
    e.stopPropagation();
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    const response = await uploadImageToCloud(file);
    if (response.result === "ERROR") return; // TODO: Silent failure.
    const objectLocationResult = await preSignedImageLocationFromKey(response.key);
    if (objectLocationResult.result === "ERROR") return; // TODO: Silent failure.
    insertLayer(objectLocationResult.url, response.dimensions.width, response.dimensions.height);
    if (onDone) onDone(e);
  }, [insertLayer, onDone]);

  return (
    <div
      className={styles.image_drop_handler}
      onDragOver={onDragOver}
      onDragLeave={onDragExit}
      onDrop={onDrop}
    />
  );
}