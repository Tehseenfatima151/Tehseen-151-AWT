import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

async function digestFile(file: File): Promise<string> {
  const buf = await file.arrayBuffer();
  const digest = await crypto.subtle.digest('SHA-256', buf);
  return Array.from(new Uint8Array(digest))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export type UploadKind = 'cnic' | 'selfie' | 'address' | 'payment' | 'profile';

@Injectable({ providedIn: 'root' })
export class StorageUploadService {
  /** Uploads a file directly to Cloudinary and tracks progress. */
  async uploadProof(
    uid: string,
    kind: UploadKind,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<{ url: string; hash: string }> {
    const hash = await digestFile(file);
    
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', environment.cloudinary.uploadPreset);
      formData.append('folder', `uploads/${uid}/${kind}`);

      const xhr = new XMLHttpRequest();
      xhr.open('POST', `https://api.cloudinary.com/v1_1/${environment.cloudinary.cloudName}/image/upload`, true);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = Math.round((event.loaded / event.total) * 100);
          onProgress(progress);
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          resolve({ url: response.secure_url, hash });
        } else {
          try {
            const errResponse = JSON.parse(xhr.responseText);
            reject(new Error(`Upload failed: ${errResponse.error?.message || xhr.statusText}`));
          } catch {
            reject(new Error(`Upload failed: ${xhr.statusText}`));
          }
        }
      };

      xhr.onerror = () => {
        reject(new Error('Upload failed due to network error.'));
      };

      xhr.send(formData);
    });
  }

  calculateHash(file: File): Promise<string> {
    return digestFile(file);
  }
}
