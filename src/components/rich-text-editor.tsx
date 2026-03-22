"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { LuBold, LuItalic, LuList, LuListOrdered, LuCode, LuQuote, LuHeading2, LuImage, LuUndo, LuRedo } from "react-icons/lu";

interface RichTextEditorProps {
  content?: string;
  placeholder?: string;
  onChange: (html: string) => void;
  onImageUpload?: () => void;
  compact?: boolean; // compact mode for replies
}

export function RichTextEditor({ content, placeholder, onChange, onImageUpload, compact }: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Image,
      Placeholder.configure({ placeholder: placeholder ?? "Write something..." }),
    ],
    content: content ?? "",
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: `prose prose-sm max-w-none focus:outline-none ${compact ? "min-h-[80px]" : "min-h-[120px]"} text-gray-800`,
      },
    },
  });

  if (!editor) return null;

  const ToolButton = ({ onClick, active, children, title }: { onClick: () => void; active?: boolean; children: React.ReactNode; title: string }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded-lg transition-colors ${active ? "bg-[#c6e135]/30 text-[#1a1a1a]" : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"}`}
    >
      {children}
    </button>
  );

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white focus-within:border-[#c6e135] transition-colors">
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-gray-100 bg-gray-50/50 flex-wrap">
        <ToolButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Bold">
          <LuBold className="w-3.5 h-3.5" />
        </ToolButton>
        <ToolButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Italic">
          <LuItalic className="w-3.5 h-3.5" />
        </ToolButton>
        {!compact && (
          <>
            <ToolButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading")} title="Heading">
              <LuHeading2 className="w-3.5 h-3.5" />
            </ToolButton>
            <ToolButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Bullet List">
              <LuList className="w-3.5 h-3.5" />
            </ToolButton>
            <ToolButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Ordered List">
              <LuListOrdered className="w-3.5 h-3.5" />
            </ToolButton>
            <ToolButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive("codeBlock")} title="Code Block">
              <LuCode className="w-3.5 h-3.5" />
            </ToolButton>
            <ToolButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} title="Quote">
              <LuQuote className="w-3.5 h-3.5" />
            </ToolButton>
          </>
        )}
        {onImageUpload && (
          <ToolButton onClick={onImageUpload} title="Add Image">
            <LuImage className="w-3.5 h-3.5" />
          </ToolButton>
        )}
        <div className="flex-1" />
        <ToolButton onClick={() => editor.chain().focus().undo().run()} title="Undo">
          <LuUndo className="w-3.5 h-3.5" />
        </ToolButton>
        <ToolButton onClick={() => editor.chain().focus().redo().run()} title="Redo">
          <LuRedo className="w-3.5 h-3.5" />
        </ToolButton>
      </div>
      {/* Editor */}
      <div className="px-4 py-3">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
