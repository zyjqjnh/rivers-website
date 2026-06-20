"use client";

import { useCallback } from "react";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Underline from "@tiptap/extension-underline";
import {
  Bold,
  Heading2,
  ImagePlus,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Redo2,
  Strikethrough,
  Underline as UnderlineIcon,
  Undo2,
} from "lucide-react";

const extensions = [
  StarterKit.configure({
    heading: { levels: [2, 3] },
  }),
  Link.configure({
    openOnClick: false,
    autolink: true,
    defaultProtocol: "https",
    HTMLAttributes: {
      rel: "noopener noreferrer nofollow",
      target: "_blank",
    },
  }),
  Image.configure({
    allowBase64: false,
    HTMLAttributes: {
      loading: "lazy",
    },
  }),
  Underline,
];

function initialHtml(value) {
  const content = String(value || "").trim();
  if (!content) return "";
  if (/<[a-z][\s\S]*>/i.test(content)) return content;
  return content
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, "<br>")}</p>`)
    .join("");
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function RichTextEditor({ name, defaultValue = "" }) {
  const editor = useEditor({
    extensions,
    content: initialHtml(defaultValue),
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "rich-text-editor-content",
        "aria-label": "Full description",
      },
    },
  });

  const state = useEditorState({
    editor,
    selector: ({ editor: currentEditor }) => ({
      html: currentEditor?.getHTML() || "",
      canUndo: currentEditor?.can().undo() || false,
      canRedo: currentEditor?.can().redo() || false,
      bold: currentEditor?.isActive("bold") || false,
      italic: currentEditor?.isActive("italic") || false,
      underline: currentEditor?.isActive("underline") || false,
      strike: currentEditor?.isActive("strike") || false,
      bulletList: currentEditor?.isActive("bulletList") || false,
      orderedList: currentEditor?.isActive("orderedList") || false,
      heading2: currentEditor?.isActive("heading", { level: 2 }) || false,
    }),
  });

  const setLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href || "";
    const url = window.prompt("Enter a link URL", previousUrl);
    if (url === null) return;
    if (!url.trim()) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url.trim() }).run();
  }, [editor]);

  const addImage = useCallback(() => {
    if (!editor) return;
    const url = window.prompt("Paste a public image URL (for example, an R2 URL)");
    if (!url?.trim()) return;
    const alt = window.prompt("Image description (optional)") || "";
    editor.chain().focus().setImage({ src: url.trim(), alt: alt.trim() }).run();
  }, [editor]);

  return (
    <div className="rich-text-editor">
      <input type="hidden" name={name} value={state?.html || initialHtml(defaultValue)} readOnly />
      <div className="rich-text-toolbar" role="toolbar" aria-label="Text formatting">
        <ToolbarButton label="Heading" active={state?.heading2} onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}>
          <Heading2 />
        </ToolbarButton>
        <ToolbarButton label="Bold" active={state?.bold} onClick={() => editor?.chain().focus().toggleBold().run()}>
          <Bold />
        </ToolbarButton>
        <ToolbarButton label="Italic" active={state?.italic} onClick={() => editor?.chain().focus().toggleItalic().run()}>
          <Italic />
        </ToolbarButton>
        <ToolbarButton label="Underline" active={state?.underline} onClick={() => editor?.chain().focus().toggleUnderline().run()}>
          <UnderlineIcon />
        </ToolbarButton>
        <ToolbarButton label="Strikethrough" active={state?.strike} onClick={() => editor?.chain().focus().toggleStrike().run()}>
          <Strikethrough />
        </ToolbarButton>
        <span className="rich-text-toolbar-divider" />
        <ToolbarButton label="Bullet list" active={state?.bulletList} onClick={() => editor?.chain().focus().toggleBulletList().run()}>
          <List />
        </ToolbarButton>
        <ToolbarButton label="Numbered list" active={state?.orderedList} onClick={() => editor?.chain().focus().toggleOrderedList().run()}>
          <ListOrdered />
        </ToolbarButton>
        <ToolbarButton label="Link" active={editor?.isActive("link")} onClick={setLink}>
          <LinkIcon />
        </ToolbarButton>
        <ToolbarButton label="Image from URL" onClick={addImage}>
          <ImagePlus />
        </ToolbarButton>
        <span className="rich-text-toolbar-divider" />
        <ToolbarButton label="Undo" disabled={!state?.canUndo} onClick={() => editor?.chain().focus().undo().run()}>
          <Undo2 />
        </ToolbarButton>
        <ToolbarButton label="Redo" disabled={!state?.canRedo} onClick={() => editor?.chain().focus().redo().run()}>
          <Redo2 />
        </ToolbarButton>
      </div>
      <EditorContent editor={editor} />
      <p className="rich-text-editor-help">Use the image button to insert a public image URL, including files hosted on Cloudflare R2.</p>
    </div>
  );
}

function ToolbarButton({ label, active = false, disabled = false, onClick, children }) {
  return (
    <button
      type="button"
      className={active ? "active" : ""}
      aria-label={label}
      aria-pressed={active}
      title={label}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
