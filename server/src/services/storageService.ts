import { storage } from '../config/firebase';
import { v4 as uuidv4 } from 'uuid';
import { Buffer } from 'buffer';

export interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

export const uploadFile = async (file: MulterFile): Promise<string> => {
  const bucket = storage.bucket();
  const filename = `memoryscape/${uuidv4()}-${file.originalname}`;
  const fileUpload = bucket.file(filename);

  const stream = fileUpload.createWriteStream({
    metadata: {
      contentType: file.mimetype,
    },
    resumable: false,
  });

  return new Promise((resolve, reject) => {
    stream.on('error', (err) => {
      reject(err);
    });

    stream.on('finish', async () => {
      // Make the file public (or generate signed URL in real app)
      await fileUpload.makePublic(); 
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;
      resolve(publicUrl);
    });

    stream.end(file.buffer);
  });
};