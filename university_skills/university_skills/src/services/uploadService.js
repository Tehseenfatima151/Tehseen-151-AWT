import { supabase } from '../lib/supabase'

export async function uploadFile(bucket, folder, file) {
  const ext = file.name.split('.').pop()
  const filePath = `${folder}/${Date.now()}.${ext}`
  const { error } = await supabase.storage.from(bucket).upload(filePath, file, {
    cacheControl: '3600',
    upsert: false,
  })
  if (error) throw error
  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath)
  return data.publicUrl
}
