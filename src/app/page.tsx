'use client'

import { useRef, useMemo } from 'react'
import { Layout, Model } from 'flexlayout-react'
import 'flexlayout-react/style/dark.css'
import { createLayoutModel, layoutColors } from '@/editor/layoutConfig'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
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

      {/* Monochrome theme: drive flexlayout's own dark theme via its CSS
          custom properties instead of fighting per-class overrides. */}
      <style>{`
        .flexlayout__layout {
          --color-text: ${layoutColors.text};
          --color-background: ${layoutColors.primary};
          --color-base: ${layoutColors.primary};
          --color-1: ${layoutColors.secondary};
          --color-2: ${layoutColors.tertiary};
          --color-3: #181818;
          --color-4: #202020;
          --color-5: #262626;
          --color-6: #303030;
          --font-family: var(--font-sans);
          --color-icon: ${layoutColors.textSecondary};
          --color-overflow: ${layoutColors.textSecondary};

          --color-tabset-background: ${layoutColors.secondary};
          --color-tabset-background-selected: ${layoutColors.secondary};
          --color-tabset-header-background: ${layoutColors.tertiary};
          --color-tabset-header: ${layoutColors.textSecondary};
          --color-tabset-divider-line: ${layoutColors.border};

          --color-tab-selected: #050505;
          --color-tab-selected-background: ${layoutColors.accent};
          --color-tab-unselected: ${layoutColors.textSecondary};
          --color-tab-unselected-background: transparent;

          --color-border-background: ${layoutColors.tertiary};
          --color-border-divider-line: ${layoutColors.border};
          --color-border-tab-selected: #050505;
          --color-border-tab-selected-background: ${layoutColors.accent};
          --color-border-tab-unselected: ${layoutColors.textSecondary};
          --color-border-tab-unselected-background: ${layoutColors.tertiary};

          --color-splitter: ${layoutColors.border};
          --color-splitter-hover: ${layoutColors.accent};
          --color-splitter-drag: ${layoutColors.accent};
        }
        .flexlayout__tab_button {
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-size: 11px;
        }
        .flexlayout__border_button {
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-size: 11px;
        }
      `}</style>
    </div>
  )
}
