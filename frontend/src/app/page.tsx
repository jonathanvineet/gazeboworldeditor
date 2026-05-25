'use client'

import { useRef, useMemo, useEffect } from 'react'
import { Layout, Model } from 'flexlayout-react'
import 'flexlayout-react/style/light.css'
import { createLayoutModel, layoutColors } from '@/editor/layoutConfig'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { useWorldStore } from '@/engine/worldStore'
import Viewport from '@/viewport/Viewport'
import SceneTree from '@/panels/SceneTree'
import Inspector from '@/panels/Inspector'
import XMLEditor from '@/panels/XMLEditor'
import Console from '@/panels/Console'
import { AssetBrowser } from '@/panels/AssetBrowser'
import Toolbar from '@/editor/Toolbar'

export default function EditorPage() {
  const layoutRef = useRef<Layout>(null)
  const layoutModel = useMemo(() => {
    const modelJson = createLayoutModel()
    return Model.fromJson(modelJson)
  }, [])

  // Enable keyboard shortcuts
  useKeyboardShortcuts()

  // Add ground plane on mount if not already present
  const addDefaultGroundPlane = useWorldStore((state) => {
    useEffect(() => {
      const store = useWorldStore.getState()
      const hasGroundPlane = store.world.models.some((m) => m.name === 'ground_plane')
      
      if (!hasGroundPlane) {
        // TODO: Add ground plane model to scene
        console.log('Ground plane would be added here')
      }
    }, [])
  })

  const factory = (node: any) => {
    const component = node.getComponent()

    switch (component) {
      case 'toolbar':
        return <Toolbar />
      case 'sceneTree':
        return <SceneTree />
      case 'inspector':
        return <Inspector />
      case 'viewport':
        return <Viewport />
      case 'xmlEditor':
        return <XMLEditor />
      case 'console':
        return <Console />
      case 'assetBrowser':
        return <AssetBrowser />
      default:
        return <div className="p-4 text-sm">Component: {component}</div>
    }
  }

  return (
    <div className="w-screen h-screen flex flex-col overflow-hidden">
      {/* Main editor layout */}
      <div className="flex-1 overflow-hidden">
        {layoutModel && (
          <Layout
            ref={layoutRef}
            model={layoutModel}
            factory={factory}
            onModelChange={() => {
              // Persist layout to localStorage if needed
            }}
          />
        )}
      </div>

      {/* Styling for layout components */}
      <style>{`
        .flexlayout__border_inner {
          background-color: ${layoutColors.tertiary};
        }
        .flexlayout__tab {
          background-color: ${layoutColors.secondary};
          border-bottom: 1px solid ${layoutColors.border};
        }
        .flexlayout__tab_active {
          background-color: ${layoutColors.accent};
          color: ${layoutColors.text};
        }
        .flexlayout__splitter {
          background-color: ${layoutColors.border};
        }
        .flexlayout__tab_button_content {
          color: ${layoutColors.textSecondary};
        }
      `}</style>
    </div>
  )
}
