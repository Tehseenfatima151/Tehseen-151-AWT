// ============================================================
// VoteSphere — Storage Service
// ============================================================
/* eslint-disable @typescript-eslint/no-explicit-any */

import { supabase } from '../lib/supabase';

const sb = supabase as any;
const MAX_IMAGE_SIZE  = 5 * 1024 * 1024;
const ALLOWED_IMAGES  = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_DOCS    = ['application/pdf'];

function validateFile(file: File, types: string[], maxSize: number): string | null {
  if (!types.includes(file.type)) return `Invalid file type. Allowed: ${types.join(', ')}`;
  if (file.size > maxSize) return `File too large. Max: ${Math.round(maxSize / 1024 / 1024)}MB`;
  return null;
}

function getPublicUrl(bucket: string, path: string): string {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export const storageService = {
  async uploadCandidatePhoto(file: File, electionId: string, candidateId: string, onProgress?: (pct: number) => void): Promise<{ url: string | null; error?: string }> {
    const err = validateFile(file, ALLOWED_IMAGES, MAX_IMAGE_SIZE);
    if (err) return { url: null, error: err };
    const ext  = file.name.split('.').pop() ?? 'jpg';
    const path = `elections/${electionId}/${candidateId}.${ext}`;
    onProgress?.(30);
    const { error } = await supabase.storage.from('candidate-photos').upload(path, file, { upsert: true, contentType: file.type });
    onProgress?.(100);
    if (error) return { url: null, error: error.message };
    return { url: getPublicUrl('candidate-photos', path) };
  },

  async uploadAvatar(file: File, userId: string, onProgress?: (pct: number) => void): Promise<{ url: string | null; error?: string }> {
    const err = validateFile(file, ALLOWED_IMAGES, MAX_IMAGE_SIZE);
    if (err) return { url: null, error: err };
    const ext  = file.name.split('.').pop() ?? 'jpg';
    const path = `${userId}/avatar.${ext}`;
    onProgress?.(30);
    const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true, contentType: file.type });
    onProgress?.(100);
    if (error) return { url: null, error: error.message };
    const url = getPublicUrl('avatars', path);
    await sb.from('profiles').update({ avatar_url: url }).eq('id', userId);
    return { url };
  },

  async uploadReport(file: File, creatorId: string): Promise<{ url: string | null; error?: string }> {
    const err = validateFile(file, ALLOWED_DOCS, 20 * 1024 * 1024);
    if (err) return { url: null, error: err };
    const path = `${creatorId}/${Date.now()}_${file.name}`;
    const { error } = await supabase.storage.from('reports').upload(path, file, { upsert: false, contentType: file.type });
    if (error) return { url: null, error: error.message };
    return { url: getPublicUrl('reports', path) };
  },

  async deleteFile(bucket: string, path: string): Promise<void> {
    const { error } = await supabase.storage.from(bucket).remove([path]);
    if (error) console.error('[StorageService] deleteFile:', error.message);
  },

  getPublicUrl,
};
