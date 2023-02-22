import axios from "axios";

type ObjectKey = string;

export function imageLocationFromKey(key: ObjectKey): string {
  return `https://ixa6abwp40.execute-api.eu-central-1.amazonaws.com/production/${key}`;
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
  key: ObjectKey,
} | {
  result: "ERROR",
  error: Error,
};

export async function uploadImageToCloud(file: File): Promise<UploadImageToCloudFunctionResponse> {
  const preSignedResponse = await axios.get<PreSignedUploadResponse>(
    `https://ixa6abwp40.execute-api.eu-central-1.amazonaws.com/production/upload`,
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
  return {
    result: "SUCCESS",
    key,
  };
}

