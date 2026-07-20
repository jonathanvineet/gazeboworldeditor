'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight, Box, Sun, Link2, Eye, EyeOff, Lock, Trash2 } from 'lucide-react'
import { useWorldStore } from '@/engine/worldStore'
import { createPatchCommand } from '@/engine/commands'
import { withModelPatch } from '@/engine/entityOps'
import { industrialClasses } from '@/ui/industrialTheme'
import type { LinkEntity, ModelEntity } from '@/types/sdf'

export default function SceneTree() {
  const { world, selectedEntity, selectEntity } = useWorldStore()
  const [expandedModels, setExpandedModels] = useState<Set<string>>(new Set())

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedModels)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedModels(newExpanded)
  }

  const isExpanded = (id: string) => expandedModels.has(id)

  return (
    <div className={`w-full h-full ${industrialClasses.panel} flex flex-col`}>
      {/* Header */}
      <div className={industrialClasses.panelHeader}>
        Scene Tree • {world.models.length} models • {world.lights.length} lights
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-1">
        {/* World root */}
        <div className="mb-1">
          <div className="px-1 py-0.5 text-xs text-[#cccccc] font-semibold">
            {world.name}
          </div>

          {/* Models */}
          {world.models.length > 0 && (
            <div className="ml-2">
              {world.models.map((model) => (
                <ModelTreeNode
                  key={model.id}
                  model={model}
                  isSelected={selectedEntity === model.id}
                  isExpanded={isExpanded(model.id)}
                  onSelect={() => selectEntity(model.id)}
                  onToggleExpanded={() => toggleExpanded(model.id)}
                  onDelete={() => useWorldStore.getState().deleteEntityById(model.id)}
                />
              ))}
            </div>
          )}

          {/* Lights */}
          {world.lights.length > 0 && (
            <div className="ml-2 mt-1">
              {world.lights.map((light) => (
                <LightTreeNode
                  key={light.id}
                  light={light}
                  isSelected={selectedEntity === light.id}
                  onSelect={() => selectEntity(light.id)}
                />
              ))}
            </div>
          )}

          {/* Includes */}
          {world.includes.length > 0 && (
            <div className="ml-2 mt-1">
              {world.includes.map((include) => (
                <IncludeTreeNode
                  key={include.id}
                  include={include}
                  isSelected={selectedEntity === include.id}
                  onSelect={() => selectEntity(include.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ModelTreeNode({
  model,
  isSelected,
  isExpanded,
  onSelect,
  onToggleExpanded,
  onDelete,
}: {
  model: ModelEntity
  isSelected: boolean
  isExpanded: boolean
  onSelect: () => void
  onToggleExpanded: () => void
  onDelete: () => void
}) {
  const hasChildren = model.links.length > 0

  const toggleVisible = () => {
    const currentWorld = useWorldStore.getState().world
    useWorldStore
      .getState()
      .executeCommand(
        createPatchCommand(
          'toggle-visible',
          withModelPatch(currentWorld, model.id, { visible: model.visible }),
          withModelPatch(currentWorld, model.id, { visible: !model.visible })
        )
      )
  }

  const toggleLocked = () => {
    const currentWorld = useWorldStore.getState().world
    useWorldStore
      .getState()
      .executeCommand(
        createPatchCommand(
          'toggle-locked',
          withModelPatch(currentWorld, model.id, { locked: model.locked }),
          withModelPatch(currentWorld, model.id, { locked: !model.locked })
        )
      )
  }

  return (
    <div className="mb-0.5">
      <div
        className={`flex items-center gap-1 px-1 py-0.5 text-xs cursor-pointer ${
          isSelected ? industrialClasses.listItemActive : industrialClasses.listItem
        }`}
        onClick={onSelect}
      >
        {/* Expand/Collapse */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onToggleExpanded()
          }}
          className="flex-shrink-0 p-0 hover:bg-[#3e3e42]"
        >
          {hasChildren ? (
            isExpanded ? (
              <ChevronDown className="w-3.5 h-3.5 text-[#858585]" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-[#858585]" />
            )
          ) : (
            <div className="w-3.5 h-3.5" />
          )}
        </button>

        {/* Icon */}
        <Box className="w-3.5 h-3.5 text-[#dcdcaa] flex-shrink-0" />

        {/* Name */}
        <span className="flex-1 truncate">{model.name}</span>

        {/* Visibility toggle */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            toggleVisible()
          }}
          className="flex-shrink-0 p-0.5 hover:bg-[#3e3e42]"
        >
          {model.visible ? (
            <Eye className="w-3 h-3 text-[#858585]" />
          ) : (
            <EyeOff className="w-3 h-3 text-[#6a6a6a]" />
          )}
        </button>

        {/* Lock toggle */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            toggleLocked()
          }}
          className="flex-shrink-0 p-0.5 hover:bg-[#3e3e42]"
        >
          {model.locked && (
            <Lock className="w-3 h-3 text-[#858585]" />
          )}
        </button>

        {/* Delete */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          className="flex-shrink-0 p-0.5 hover:bg-[#f48771] hover:bg-opacity-20"
        >
          <Trash2 className="w-3 h-3 text-[#6a6a6a] hover:text-[#f48771]" />
        </button>
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div className="ml-2">
          {model.links.map((link: LinkEntity) => (
            <LinkTreeNode key={link.id} link={link} parentId={model.id} />
          ))}
        </div>
      )}
    </div>
  )
}

function LinkTreeNode({ link, parentId }: any) {
  return (
    <div className="mb-0.5">
      <div className={`flex items-center gap-1 px-1 py-0.5 text-xs ${industrialClasses.listItem}`}>
        <div className="w-3.5 h-3.5" />
        <Link2 className="w-3.5 h-3.5 text-[#9cdcfe] flex-shrink-0" />
        <span className="flex-1 truncate text-[#cccccc]">{link.name}</span>
        <Eye className="w-3 h-3 text-[#858585]" />
      </div>
    </div>
  )
}

function LightTreeNode({ light, isSelected, onSelect }: any) {
  return (
    <div
      className={`flex items-center gap-1 px-1 py-0.5 text-xs cursor-pointer mb-0.5 ${
        isSelected ? industrialClasses.listItemActive : industrialClasses.listItem
      }`}
      onClick={onSelect}
    >
      <div className="w-3.5 h-3.5" />
      <Sun className="w-3.5 h-3.5 text-[#dcdcaa] flex-shrink-0" />
      <span className="flex-1 truncate">{light.name}</span>
      <Eye className="w-3 h-3 text-[#858585]" />
    </div>
  )
}

function IncludeTreeNode({ include, isSelected, onSelect }: any) {
  return (
    <div
      className={`flex items-center gap-1 px-1 py-0.5 text-xs cursor-pointer mb-0.5 ${
        isSelected ? industrialClasses.listItemActive : industrialClasses.listItem
      }`}
      onClick={onSelect}
    >
      <div className="w-3.5 h-3.5" />
      <Link2 className="w-3.5 h-3.5 text-[#ce9178] flex-shrink-0" />
      <span className="flex-1 truncate text-[#858585]">{include.uri}</span>
    </div>
  )
}
