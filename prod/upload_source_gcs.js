/**
 * Usage:
 *
 * BUCKET_NAME= DIR= node upload_source_gcs.js.
 */

import { readdir, stat } from 'fs/promises';
import { join, relative } from 'path';

import { Storage } from '@google-cloud/storage';

const DIR = process.env.DIR;
const BUCKET_NAME = process.env.BUCKET_NAME;
const BASE = process.env.BASE;

(async function main() {
  // Creates a client
  const storage = new Storage();

  // get the list of files from the specified directory
  const fileList = [];

  async function upload() {
    return await Promise.all(
      fileList.map((filePath) => {
        const destination = join(BASE, relative(DIR, filePath));
        console.log('-> ', destination);

        return storage
          .bucket(BUCKET_NAME)
          .upload(filePath, {
            destination,
            metadata: {
              cacheControl: `public, max-age=${86400 * 7}`,
            },
            gzip: true,
          })
          .then(
            (uploadResp) => ({
              fileName: destination,
              status: uploadResp[0],
            }),
            (err) => {
              throw err;
            }
          );
      })
    );
  }

  async function getFiles(directory) {
    const items = await readdir(directory);

    await Promise.all(
      items.map(async (item) => {
        const fullPath = join(directory, item);
        const file = await stat(fullPath);

        if (file.isFile()) {
          fileList.push(fullPath);
        } else if (file.isDirectory()) {
          await getFiles(fullPath);
        }
        return true;
      })
    );
  }

  console.log(`[Assets] Uploading to "gs://${BUCKET_NAME}/" from "${DIR}"`);

  await getFiles(DIR);

  await upload();

  console.log(
    `[Assets] ${fileList.length} files uploaded to ${BUCKET_NAME} successfully.`
  );
})();
