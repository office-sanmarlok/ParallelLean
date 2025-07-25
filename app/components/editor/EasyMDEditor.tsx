'use client'

import { useEffect, useRef, useState } from 'react'
import EasyMDE from 'easymde'
import 'easymde/dist/easymde.min.css'
import './EasyMDEditor.css'
import { uploadImage } from '@/app/lib/supabase/storage'
import { useAuthStore } from '@/app/stores/authStore'

interface EasyMDEditorProps {
  value: string
  onChange: (value: string) => void
  nodeId: string
  placeholder?: string
}

export function EasyMDEditor({ value, onChange, nodeId, placeholder }: EasyMDEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const easyMDERef = useRef<EasyMDE | null>(null)
  const [uploading, setUploading] = useState(false)
  const { user } = useAuthStore()

  useEffect(() => {
    if (!textareaRef.current) return
    
    // 既に初期化されている場合はスキップ
    if (easyMDERef.current) {
      return
    }

    // カスタムアップロード関数
    const imageUploadFunction = async (file: File) => {
      if (!user?.id) {
        alert('ログインが必要です')
        return null
      }

      setUploading(true)
      try {
        const result = await uploadImage(file, nodeId, user.id)
        
        if ('error' in result) {
          alert(result.error)
          return null
        }

        return result.url
      } catch (error) {
        console.error('Upload error:', error)
        alert('アップロードに失敗しました')
        return null
      } finally {
        setUploading(false)
      }
    }

    // EasyMDEの設定
    const options: EasyMDE.Options = {
      element: textareaRef.current,
      initialValue: value,
      placeholder: placeholder || 'Write your content here...',
      autosave: {
        enabled: false, // 外部で自動保存を管理
        uniqueId: `easymde-${nodeId}`, // 必須のuniqueIdプロパティを追加
      },
      spellChecker: false,
      uploadImage: true,
      imageUploadFunction,
      imageMaxSize: 10 * 1024 * 1024, // 10MB
      imagePathAbsolute: true,
      toolbar: [
        'bold', 'italic', 'heading', '|',
        'quote', 'unordered-list', 'ordered-list', '|',
        'link', 'upload-image', '|',
        'preview', 'side-by-side', 'fullscreen', '|',
        'guide'
      ],
      status: ['lines', 'words', 'cursor'],
      previewClass: 'markdown-preview',
      renderingConfig: {
        singleLineBreaks: false,
        codeSyntaxHighlighting: true,
      },
    }

    const editor = new EasyMDE(options)
    
    // エディターが初期化されたことを確認
    console.log('EasyMDE initialized', editor)
    
    // エディター要素にフォーカス
    setTimeout(() => {
      editor.codemirror.focus()
    }, 100)

    // 値の変更を監視
    editor.codemirror.on('change', () => {
      const newValue = editor.value()
      onChange(newValue)
    })

    easyMDERef.current = editor

    // クリーンアップ
    return () => {
      if (easyMDERef.current) {
        // CodeMirrorインスタンスのイベントリスナーを削除
        easyMDERef.current.codemirror.off('change')
        easyMDERef.current.toTextArea()
        easyMDERef.current = null
      }
    }
  }, []) // 依存配列を空にして初回のみ実行

  // 外部からの値の変更を反映
  useEffect(() => {
    if (easyMDERef.current && easyMDERef.current.value() !== value) {
      easyMDERef.current.value(value)
    }
  }, [value])

  return (
    <div className="easy-mde-container">
      <textarea ref={textareaRef} />
      {uploading && (
        <div className="absolute top-0 left-0 right-0 bottom-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded shadow">
            <p className="text-gray-700">画像をアップロード中...</p>
          </div>
        </div>
      )}
    </div>
  )
}