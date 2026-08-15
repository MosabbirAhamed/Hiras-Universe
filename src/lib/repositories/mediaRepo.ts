/**
 * mediaRepo.ts — Supabase migration shim
 * All exports are now served from supabaseMediaRepo.ts.
 * This file exists only to preserve import paths across the codebase.
 */
export {
  getAllMedia,
  saveAllMedia,
  createMediaFromUpload,
  deleteMediaById,
  findMediaById,
  findMediaByFilename,
} from './supabaseMediaRepo'
