'use client';

import React from 'react';
import { useWorldStore } from '@/store/worldStore';
import { CheckboxField, ColorField, PropSection } from './FormFields';

export default function SceneProperties() {
  const world = useWorldStore(s => s.world);
  const updateScene = useWorldStore(s => s.updateScene);

  return (
    <div>
      <PropSection title="Scene">
        <ColorField
          label="Ambient"
          value={world.scene.ambient}
          onChange={v => updateScene({ ambient: v })}
        />
        <ColorField
          label="Background"
          value={world.scene.background}
          onChange={v => updateScene({ background: v })}
        />
        <CheckboxField
          label="Shadows"
          value={world.scene.shadows}
          onChange={v => updateScene({ shadows: v })}
        />
        <CheckboxField
          label="Show Grid"
          value={world.scene.grid}
          onChange={v => updateScene({ grid: v })}
        />
      </PropSection>
    </div>
  );
}
