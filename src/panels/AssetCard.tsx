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
        bg-[#0b0b0b]
        border border-[#232323]
        p-3
        cursor-grab
        active:cursor-grabbing
        transition-all
        duration-150
        hover:border-[#eaeaea]
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
          bg-[#050505]
          border border-[#232323]
          mb-2
          text-4xl
          font-bold
          text-[#f2f2f2]
          group-hover:bg-[#0e0e0e]
          transition-colors
        "
      >
        {asset.thumbnail}
      </div>

      {/* Metadata */}
      <div className="space-y-1 text-xs">
        {/* Name */}
        <div className="text-[#f2f2f2] font-semibold truncate">
          {asset.name}
        </div>

        {/* Category */}
        <div className="text-[#8a8a8a] text-xs font-mono">
          {asset.category.charAt(0).toUpperCase() + asset.category.slice(1)}
        </div>

        {/* Triangle count */}
        <div className="text-[#8a8a8a] text-xs font-mono">
          {asset.triangles.toLocaleString()} tris
        </div>

        {/* SDF Version */}
        <div className="text-[#525252] text-xs font-mono">
          SDF {asset.sdfVersion}
        </div>

        {/* Author */}
        {asset.author && (
          <div className="text-[#525252] text-xs truncate">
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
                  border border-[#2a2a2a]
                  text-[#8a8a8a]
                  text-xs
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
            bg-[#eaeaea]
            text-[#050505]
            hover:bg-white
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
              bg-[#141414]
              border border-[#ff5c5c]
              text-[#ff5c5c]
              hover:bg-[#ff5c5c]
              hover:text-[#050505]
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
          text-[#525252]
          text-xs
          font-mono
          opacity-0
          group-hover:opacity-70
          transition-opacity
          pointer-events-none
        "
      >
        drag
      </div>
    </div>
  );
}
