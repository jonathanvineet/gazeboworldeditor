'use client';

import { useDrag, DragSourceMonitor } from 'react-dnd';
import { Trash2, Download } from 'lucide-react';
import { AssetMetadata } from '@/lib/assetDatabase';

interface AssetCardProps {
  asset: AssetMetadata;
  onDelete?: (id: string) => void;
}

export function AssetCard({ asset, onDelete }: AssetCardProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'asset',
    item: asset,
    collect: (monitor: DragSourceMonitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={(node) => { drag(node) }}
      className="
        group
        relative
        bg-[#2d2d30]
        border border-[#3e3e42]
        rounded
        p-3
        cursor-grab
        active:cursor-grabbing
        transition-all
        duration-200
        hover:border-[#0e639c]
        hover:shadow-lg
        hover:shadow-[#0e639c]/30
        hover:scale-105
      "
      style={{
        opacity: isDragging ? 0.5 : 1,
      }}
    >
      {/* Thumbnail */}
      <div
        className="
          flex
          items-center
          justify-center
          h-24
          bg-[#1e1e1e]
          border border-[#3e3e42]
          rounded
          mb-2
          text-4xl
          font-bold
          text-[#dcdcaa]
          group-hover:bg-[#252526]
          transition-colors
        "
      >
        {asset.thumbnail}
      </div>

      {/* Metadata */}
      <div className="space-y-1 text-xs">
        {/* Name */}
        <div className="text-[#cccccc] font-semibold truncate">
          {asset.name}
        </div>

        {/* Category */}
        <div className="text-[#ce9178] text-xs">
          {asset.category.charAt(0).toUpperCase() + asset.category.slice(1)}
        </div>

        {/* Triangle count */}
        <div className="text-[#9cdcfe] text-xs">
          {asset.triangles.toLocaleString()} tris
        </div>

        {/* SDF Version */}
        <div className="text-[#808080] text-xs">
          SDF {asset.sdfVersion}
        </div>

        {/* Author */}
        {asset.author && (
          <div className="text-[#808080] text-xs truncate">
            by {asset.author}
          </div>
        )}

        {/* Tags */}
        {asset.tags && asset.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {asset.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="
                  inline-block
                  px-1.5
                  py-0.5
                  bg-[#0e639c]
                  text-[#ffffff]
                  rounded
                  text-xs
                  opacity-75
                "
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Action buttons - only show on hover */}
      <div
        className="
          absolute
          top-1
          right-1
          flex
          gap-1
          opacity-0
          group-hover:opacity-100
          transition-opacity
        "
      >
        <button
          className="
            p-1
            bg-[#0e639c]
            text-white
            rounded
            hover:bg-[#1177bb]
            transition-colors
          "
          title="Import model"
        >
          <Download size={14} />
        </button>
        {onDelete && (
          <button
            onClick={() => onDelete(asset.id)}
            className="
              p-1
              bg-[#d16969]
              text-white
              rounded
              hover:bg-[#e81e1e]
              transition-colors
            "
            title="Delete from library"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      {/* Drag indicator */}
      <div
        className="
          absolute
          bottom-1
          right-1
          text-[#808080]
          text-xs
          opacity-0
          group-hover:opacity-50
          transition-opacity
          pointer-events-none
        "
      >
        drag
      </div>
    </div>
  );
}
