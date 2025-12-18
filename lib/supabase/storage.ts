
import { supabase } from './client';

export const storageService = {
  /**
   * Tải tệp lên Supabase Storage
   * @param bucket Tên bucket (ví dụ: 'tbs-crm')
   * @param path Đường dẫn trong bucket (ví dụ: 'tasks/T1/evidence.png')
   * @param file Đối tượng File từ input
   */
  async uploadFile(bucket: string, path: string, file: File): Promise<string> {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        upsert: true,
        cacheControl: '3600'
      });

    if (error) throw error;

    // Lấy URL công khai
    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return publicUrlData.publicUrl;
  },

  async deleteFile(bucket: string, path: string): Promise<void> {
    const { error } = await supabase.storage.from(bucket).remove([path]);
    if (error) throw error;
  }
};
