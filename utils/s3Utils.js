import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import crypto from 'crypto';
import { bucketName, s3 } from '../index.js';

const randomImageName = (bytes = 32) =>
  crypto.randomBytes(bytes).toString('hex');

export const uploadImageToS3 = async (buffer, mimetype) => {
  const photoName = randomImageName();
  const params = {
    Bucket: bucketName,
    Key: photoName,
    Body: buffer,
    ContentType: mimetype,
  };
  const command = new PutObjectCommand(params);
  await s3.send(command);
  return photoName;
};

export const getSignedUrlForImage = async (photoKey) => {
  const getObjectParams = {
    Bucket: bucketName,
    Key: photoKey,
  };
  const command = new GetObjectCommand(getObjectParams);
  const url = await getSignedUrl(s3, command);
  return url;
};

export const deleteImageFromS3 = async (photoKey) => {
  const params = {
    Bucket: bucketName,
    Key: photoKey,
  };
  const command = new DeleteObjectCommand(params);
  await s3.send(command);
};
