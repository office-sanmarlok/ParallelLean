import { createClient } from './client'
import type { Database } from '@/src/types/database.generated'

type AttachmentInsert = Database['public']['Tables']['attachments']['Insert']

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']

export async function uploadImage(
  file: File,
  nodeId: string,
  userId: string
): Promise<{ url: string; attachmentId: string } | { error: string }> {
  const supabase = createClient()

  // ファイルサイズチェック
  if (file.size > MAX_FILE_SIZE) {
    return { error: 'ファイルサイズは10MB以下にしてください' }
  }

  // ファイルタイプチェック
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return { error: '画像ファイル（JPG、PNG、GIF、WebP）のみアップロード可能です' }
  }

  // ユニークなファイル名を生成
  const fileExt = file.name.split('.').pop()
  const fileName = `${crypto.randomUUID()}.${fileExt}`
  const storagePath = `${userId}/${nodeId}/${fileName}`

  // Supabaseストレージにアップロード
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('attachments')
    .upload(storagePath, file)

  if (uploadError) {
    console.error('Upload error:', uploadError)
    return { error: 'ファイルのアップロードに失敗しました' }
  }

  // アップロードしたファイルの公開URLを取得
  const { data: { publicUrl } } = supabase.storage
    .from('attachments')
    .getPublicUrl(storagePath)

  // attachmentsテーブルに記録
  const attachmentData: AttachmentInsert = {
    node_id: nodeId,
    file_name: file.name,
    file_type: file.type,
    file_size: file.size,
    storage_path: storagePath,
  }

  const { data: attachment, error: dbError } = await supabase
    .from('attachments')
    .insert(attachmentData)
    .select()
    .single()

  if (dbError) {
    console.error('Database error:', dbError)
    // アップロードしたファイルを削除
    await supabase.storage.from('attachments').remove([storagePath])
    return { error: 'データベースへの記録に失敗しました' }
  }

  return { url: publicUrl, attachmentId: attachment.id }
}

export async function deleteAttachment(attachmentId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient()

  // attachmentの情報を取得
  const { data: attachment, error: fetchError } = await supabase
    .from('attachments')
    .select('storage_path')
    .eq('id', attachmentId)
    .single()

  if (fetchError || !attachment) {
    return { success: false, error: 'ファイル情報の取得に失敗しました' }
  }

  // ストレージからファイルを削除
  const { error: storageError } = await supabase.storage
    .from('attachments')
    .remove([attachment.storage_path])

  if (storageError) {
    console.error('Storage delete error:', storageError)
    return { success: false, error: 'ストレージからの削除に失敗しました' }
  }

  // データベースから記録を削除
  const { error: dbError } = await supabase
    .from('attachments')
    .delete()
    .eq('id', attachmentId)

  if (dbError) {
    console.error('Database delete error:', dbError)
    return { success: false, error: 'データベースからの削除に失敗しました' }
  }

  return { success: true }
}

export async function getNodeAttachments(nodeId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('attachments')
    .select('*')
    .eq('node_id', nodeId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Fetch attachments error:', error)
    return []
  }

  return data.map(attachment => ({
    ...attachment,
    url: supabase.storage.from('attachments').getPublicUrl(attachment.storage_path).data.publicUrl
  }))
}