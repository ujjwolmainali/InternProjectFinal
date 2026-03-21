'use client';

import { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';

interface EditorProps {
  data: string;
  onChange: (data: string) => void;
}

declare global {
  interface Window {
    ClassicEditor: any;
  }
}

const CKEditorWrapper = ({ data, onChange }: EditorProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<any>(null);
  const lock = useRef(false);

  useEffect(() => {
    if (lock.current) return;
    if (!containerRef.current || !window.ClassicEditor) return;

    lock.current = true;

    window.ClassicEditor.create(containerRef.current).then((editor:any) => {
      editorRef.current = editor;
      editor.setData(data || '');

      editor.model.document.on('change:data', () => {
        onChange(editor.getData());
      });
    });

    return () => {
      editorRef.current?.destroy();
      editorRef.current = null;
      lock.current = false;
    };
  }, []);

  useEffect(() => {
    if (editorRef.current && editorRef.current.getData() !== data) {
      editorRef.current.setData(data || '');
    }
  }, [data]);

  return <div ref={containerRef} />;
};

export default dynamic(() => Promise.resolve(CKEditorWrapper), {
  ssr: false,
});
