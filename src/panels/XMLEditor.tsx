'use client'

import { useEffect, useRef, useState } from 'react'
import Editor, { OnMount } from '@monaco-editor/react'
import { useWorldStore } from '@/engine/worldStore'
import { exportWorld } from '@/sdf/serializer'
import { SDFParser } from '@/sdf/parser'

export default function XMLEditor() {
  const { world, loadWorld } = useWorldStore()
  const [error, setError] = useState<string | null>(null)
  const [dirty, setDirty] = useState(false)
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null)
  const lastAppliedXml = useRef<string>('')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Re-sync the editor content whenever the world changes from *outside*
  // this editor (viewport edits, undo/redo) — but not while the user is
  // actively typing here, and not for the change we just applied ourselves.
  useEffect(() => {
    const xml = exportWorld(world, 'world')
    if (dirty) return
    if (xml === lastAppliedXml.current) return
    lastAppliedXml.current = xml
    editorRef.current?.setValue(xml)
  }, [world, dirty])

  const applyXml = (xml: string) => {
    try {
      const parsed = SDFParser.parseWorld(xml)
      lastAppliedXml.current = xml
      loadWorld(parsed)
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to parse SDF XML')
    }
  }

  const handleChange = (value: string | undefined) => {
    if (value === undefined) return
    setDirty(true)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      applyXml(value)
      setDirty(false)
    }, 600)
  }

  return (
    <div className="w-full h-full bg-[#050505] flex flex-col">
      <div className="flex items-center justify-between text-xs text-[#8a8a8a] p-2 border-b border-[#141414]">
        <div className="flex gap-2">
          <button
            onClick={() => {
              const xml = editorRef.current?.getValue()
              if (xml !== undefined) {
                if (debounceRef.current) clearTimeout(debounceRef.current)
                applyXml(xml)
                setDirty(false)
              }
            }}
            className="px-2 py-1 bg-[#141414] hover:bg-[#202020] rounded"
          >
            Apply
          </button>
          <button
            onClick={() => navigator.clipboard.writeText(editorRef.current?.getValue() ?? '')}
            className="px-2 py-1 bg-[#141414] hover:bg-[#202020] rounded"
          >
            Copy to Clipboard
          </button>
        </div>
        {error ? (
          <span className="text-[#ff5c5c]">{error}</span>
        ) : dirty ? (
          <span className="text-[#8a8a8a]">Editing…</span>
        ) : (
          <span className="text-[#eaeaea]">Synced</span>
        )}
      </div>
      <div className="flex-1">
        <Editor
          defaultLanguage="xml"
          theme="vs-dark"
          defaultValue={exportWorld(world, 'world')}
          onMount={(editor) => {
            editorRef.current = editor
            lastAppliedXml.current = editor.getValue()
          }}
          onChange={handleChange}
          options={{
            minimap: { enabled: false },
            fontSize: 12,
            scrollBeyondLastLine: false,
            wordWrap: 'on',
          }}
        />
      </div>
    </div>
  )
}
