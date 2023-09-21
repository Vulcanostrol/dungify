import styles from "./ImageDropHandler.module.css";
import React, {useState} from "react";
import {preSignedImageLocationFromKey, uploadImageToCloud} from "@/cloud";
import {useMutation} from "liveblocks.config";
import {LayerObject, LayerObjectTypes} from "@/types";
import {nanoid} from "nanoid";
import {LiveObject} from "@liveblocks/client";

type Props = {
  onCancel?: (e: React.DragEvent) => void,
  onDone?: (e: React.DragEvent) => void,
}

type UploadStatus = "WAITING" | "ACCEPTED" | "UPLOADING" | "UPLOADED" | "INSERTED" | "ERROR";

const uploadStatusProps = {
  WAITING: {
    width: "0%",
    text: "",
    error: false,
  },
  ACCEPTED: {
    width: "15%",
    text: "15%",
    error: false,
  },
  UPLOADING: {
    width: "40%",
    text: "40%",
    error: false,
  },
  UPLOADED: {
    width: "80%",
    text: "80%",
    error: false,
  },
  INSERTED: {
    width: "100%",
    text: "100%",
    error: false,
  },
  ERROR: {
    width: "100%",
    text: "error",
    error: true,
  }
}

export default function ImageDropHandler({onCancel, onDone}: Props) {

  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("WAITING");

  const insertLayer = useMutation(
    ({storage}, imageKey: string, imageLocation: string, width: number, height: number) => {
      const objectMap = storage.get("objects");
      const topLevelGroup = storage.get("topLevelGroup");
      const objectId = nanoid();
      const object = new LiveObject<LayerObject>({
        type: LayerObjectTypes.Token,
        x: 0,
        y: 0,
        href: imageLocation,
        key: imageKey,
        width,
        height,
      });
      topLevelGroup.get("layers").push(new LiveObject({
        type: "LAYER",
        name: "Layer",
        locked: false,
        object: objectId,
      }));
      objectMap.set(objectId, object);
    },
    [uploadStatus, setUploadStatus],
  );

  /*
   * Drag-and-drop events.
   */

  const onDragOver = React.useCallback((e: React.DragEvent) => {
    setUploadStatus("WAITING");
    e.preventDefault(); // Prevents opening image file in new window.
  }, [setUploadStatus]);

  const onDragExit = React.useCallback((e: React.DragEvent) => {
    if (onCancel) onCancel(e);
  }, [onCancel]);

  const onDrop = useMutation( async ({}, e: React.DragEvent) => {
    setUploadStatus("ACCEPTED");
    // Catches event where file is dropped in window.
    e.stopPropagation();
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    const response = await uploadImageToCloud(file);
    setUploadStatus("UPLOADING");
    if (response.result === "ERROR") {
      setUploadStatus("ERROR");
      return;
    }
    const objectLocationResult = await preSignedImageLocationFromKey(response.key);
    if (objectLocationResult.result === "ERROR") {
      setUploadStatus("ERROR");
      return;
    }
    setUploadStatus("UPLOADED");
    insertLayer(response.key, objectLocationResult.url, response.dimensions.width, response.dimensions.height);
    setUploadStatus("INSERTED");
    if (onDone) onDone(e);
  }, [insertLayer, onDone, setUploadStatus]);

  return (
    <div
      className={styles.image_drop_handler}
      onDragOver={onDragOver}
      onDragLeave={onDragExit}
      onDrop={onDrop}
    >
      <div className={styles.loading_bar}>
        <div className={`${styles.progress_bar} ${uploadStatusProps[uploadStatus].error ? "error" : ""}`} style={{ width: uploadStatusProps[uploadStatus].width }}>
          <p>{uploadStatusProps[uploadStatus].text}</p>
        </div>
      </div>
    </div>
  );
}