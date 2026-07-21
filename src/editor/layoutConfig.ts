/**
 * Professional Docking Layout Configuration
 * Using flexlayout-react for IDE-like interface
 */

import { IJsonModel } from 'flexlayout-react'

export const createLayoutModel = (): IJsonModel => ({
  global: {
    tabEnableClose: false,
    tabEnableDrag: true,
    tabEnableRename: false,
    tabSetEnableDeleteWhenEmpty: false,
    splitterSize: 4,
    splitterExtra: 0,
    borderEnableDrop: true,
  },
  borders: [
    {
      type: 'border',
      location: 'top',
      barSize: 40,
      children: [
        {
          type: 'tab',
          name: 'Toolbar',
          component: 'toolbar',
          enableClose: false,
          enableDrag: false,
        },
      ],
    },
  ],
  layout: {
    type: 'row',
    weight: 100,
    children: [
      {
        type: 'row',
        weight: 20,
        children: [
          {
            type: 'tabset',
            weight: 50,
            children: [
              {
                type: 'tab',
                name: 'Scene Tree',
                component: 'sceneTree',
              },
              {
                type: 'tab',
                name: 'Asset Browser',
                component: 'assetBrowser',
              },
            ],
          },
          {
            type: 'tabset',
            weight: 50,
            children: [
              {
                type: 'tab',
                name: 'Console',
                component: 'console',
              },
            ],
          },
        ],
      },
      {
        type: 'row',
        weight: 60,
        children: [
          {
            type: 'tabset',
            weight: 100,
            children: [
              {
                type: 'tab',
                name: 'Viewport',
                component: 'viewport',
              },
              {
                type: 'tab',
                name: 'XML Editor',
                component: 'xmlEditor',
              },
            ],
          },
        ],
      },
      {
        type: 'row',
        weight: 20,
        children: [
          {
            type: 'tabset',
            weight: 100,
            children: [
              {
                type: 'tab',
                name: 'Inspector',
                component: 'inspector',
              },
            ],
          },
        ],
      },
    ],
  },
})

export const componentFactory = (component: string, node: any) => {
  const componentMap: Record<string, string> = {
    toolbar: 'Toolbar',
    sceneTree: 'SceneTree',
    assetBrowser: 'AssetBrowser',
    console: 'Console',
    viewport: 'Viewport',
    xmlEditor: 'XMLEditor',
    inspector: 'Inspector',
  }

  return componentMap[component] || 'Unknown'
}

export const layoutColors = {
  primary: '#050505',
  secondary: '#0b0b0b',
  accent: '#eaeaea',
  tertiary: '#101010',
  text: '#f2f2f2',
  textSecondary: '#8a8a8a',
  border: '#232323',
}

