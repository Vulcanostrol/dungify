import axios from "axios";
import {Dimensions} from "@/types";

type ObjectKey = string;

export async function imageDimensions(file: File): Promise<Dimensions> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      resolve({
        width: image.width,
        height: image.height,
      });
    };
    setTimeout(() => reject(new Error("Took too long to find image's dimensions (10s).")), 10000);
    image.src = URL.createObjectURL(file);
  });
}

export function imageLocationFromKey(key: ObjectKey): string {
  return `https://iyfgfpi6c4.execute-api.eu-central-1.amazonaws.com/production/${key}`;
}

type PresSignedImageDownloadResponse = {
  url: string,
}

type PreSignedImageLocationFromKeyFunctionResponse = {
  result: "SUCCESS",
  url: string,
} | {
  result: "ERROR",
  error: Error,
};

export async function preSignedImageLocationFromKey(key: ObjectKey): Promise<PreSignedImageLocationFromKeyFunctionResponse> {
  const preSignedResponse = await axios.get<PresSignedImageDownloadResponse>(
    imageLocationFromKey(key),
  );
  if (preSignedResponse.status !== 200) return {
    result: "ERROR",
    error: new Error("Could not retrieve pre-signed URL to get image from API Gateway."),
  }
  return {
    result: "SUCCESS",
    url: preSignedResponse.data.url,
  }
}

type PreSignedUploadResponse = {
  url: string,
  key: ObjectKey,
};

type UploadImageToCloudFunctionResponse = {
  result: "SUCCESS",
  dimensions: Dimensions,
  key: ObjectKey,
} | {
  result: "ERROR",
  error: Error,
};

export async function uploadImageToCloud(file: File): Promise<UploadImageToCloudFunctionResponse> {
  const preSignedResponse = await axios.get<PreSignedUploadResponse>(
    `https://iyfgfpi6c4.execute-api.eu-central-1.amazonaws.com/production/upload`,
  );
  if (preSignedResponse.status !== 200) return {
    result: "ERROR",
    error: new Error("Could not fetch pre-signed URL to upload image."),
  }
  // Retrieved pre-signed URL.
  const {url, key} = preSignedResponse.data;
  const {type} = file;
  const putFileResponse = await axios.put(
    url,
    await file.arrayBuffer(),
    {
      headers: {"Content-Type": type},
    },
  );
  if (putFileResponse.status !== 200) return {
    result: "ERROR",
    error: new Error("Failed to upload image to S3 with pre-signed URL."),
  }
  const dimensions = await imageDimensions(file);
  return {
    result: "SUCCESS",
    dimensions,
    key,
  };
}

