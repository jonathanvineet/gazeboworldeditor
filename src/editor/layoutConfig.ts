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
    tabSetMode: 'top',
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
        type: 'column',
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
        type: 'column',
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
        type: 'column',
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
  primary: '#1e1e1e',
  secondary: '#252526',
  accent: '#3e3e42',
  tertiary: '#2d2d30',
  text: '#cccccc',
  textSecondary: '#858585',
  border: '#464647',
}

