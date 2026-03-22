"use client";

import { useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import {
  LuBold, LuItalic, LuList, LuListOrdered, LuCode, LuQuote,
  LuHeading2, LuHeading3, LuImage, LuUndo, LuRedo,
  LuStrikethrough, LuMinus, LuLink,
} from "react-icons/lu";

interface RichTextEditorProps {
  content?: string;
  placeholder?: string;
  onChange: (html: string) => void;
  compact?: boolean;
}

export function RichTextEditor({ content, placeholder, onChange, compact }: RichTextEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Image.configure({ inline: false, allowBase64: true }),
      Placeholder.configure({ placeholder: placeholder ?? "Write something..." }),
    ],
    content: content ?? "",
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: `prose prose-sm max-w-none focus:outline-none ${compact ? "min-h-[80px]" : "min-h-[150px]"} text-gray-800`,
      },
    },
  });

  if (!editor) return null;

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || !editor) return;

    const formData = new FormData();
    Array.from(files).forEach((f) => formData.append("files", f));

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.urls) {
        data.urls.forEach((url: string) => {
          editor.chain().focus().setImage({ src: url }).run();
        });
      }
    } catch (err) {
      console.error("Upload failed:", err);
    }

    // Reset input so same file can be selected again
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function insertLink() {
    const url = window.prompt("Enter URL:");
    if (url && editor) {
      editor.chain().focus().setMark("link", { href: url }).run();
    }
  }

  const ToolButton = ({ onClick, active, children, title }: {
    onClick: () => void; active?: boolean; children: React.ReactNode; title: string;
  }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded-lg transition-colors ${
        active ? "bg-[#c6e135]/30 text-[#1a1a1a]" : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
      }`}
    >
      {children}
    </button>
  );

  const Separator = () => <div className="w-px h-4 bg-gray-200 mx-0.5" />;

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white focus-within:border-[#c6e135] transition-colors">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleImageUpload}
        className="hidden"
      />

      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-gray-100 bg-gray-50/50 flex-wrap">
        {/* Text formatting */}
        <ToolButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Bold (Ctrl+B)">
          <LuBold className="w-3.5 h-3.5" />
        </ToolButton>
        <ToolButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Italic (Ctrl+I)">
          <LuItalic className="w-3.5 h-3.5" />
        </ToolButton>
        <ToolButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} title="Strikethrough">
          <LuStrikethrough className="w-3.5 h-3.5" />
        </ToolButton>
        <ToolButton onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive("code")} title="Inline Code">
          <LuCode className="w-3.5 h-3.5" />
        </ToolButton>

        {!compact && (
          <>
            <Separator />

            {/* Structure */}
            <ToolButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} title="Heading 2">
              <LuHeading2 className="w-3.5 h-3.5" />
            </ToolButton>
            <ToolButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })} title="Heading 3">
              <LuHeading3 className="w-3.5 h-3.5" />
            </ToolButton>
            <ToolButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Bullet List">
              <LuList className="w-3.5 h-3.5" />
            </ToolButton>
            <ToolButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Ordered List">
              <LuListOrdered className="w-3.5 h-3.5" />
            </ToolButton>
            <ToolButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} title="Quote">
              <LuQuote className="w-3.5 h-3.5" />
            </ToolButton>
            <ToolButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive("codeBlock")} title="Code Block">
              <LuCode className="w-3.5 h-3.5" />
            </ToolButton>
            <ToolButton onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Divider">
              <LuMinus className="w-3.5 h-3.5" />
            </ToolButton>
          </>
        )}

        <Separator />

        {/* Media */}
        <ToolButton onClick={() => fileInputRef.current?.click()} title="Upload Image">
          <LuImage className="w-3.5 h-3.5" />
        </ToolButton>

        <div className="flex-1" />

        {/* History */}
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
