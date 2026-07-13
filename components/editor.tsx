"use client"

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Toolbar } from './editor-toolbar' 
import { useEffect } from 'react'

const TiptapEditor = ({ value, onChange }: { value: string; onChange: (val: string) => void }) => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none p-4 min-h-[250px] focus:outline-none dark:prose-invert",
      },
    },
  })
  useEffect(() => {
  if (editor && value !== editor.getHTML()) {
    editor.commands.setContent(value);
  }
}, [value, editor]);
  return (
    <div className="w-full border rounded-md overflow-hidden bg-background">
      {/* Sənin ayrica yaratdığın toolbar-a editor obyektini göndəririk */}
      <Toolbar editor={editor} />
      
      <EditorContent editor={editor} className="prose prose-sm max-w-none p-4 min-h-[200px] focus:outline-none [&_ul]:list-disc [&_ul]:ml-4 [&_ol]:list-decimal [&_ol]:ml-4" />
    </div>
  )
}

export default TiptapEditor