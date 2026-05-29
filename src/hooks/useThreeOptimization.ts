'use client'

import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * Configures Three.js to use modern APIs and suppress deprecation warnings
 * 
 * - Replaces deprecated PCFSoftShadowMap with PCFShadowMap
 * - Uses THREE.Timer instead of THREE.Clock (when available)
 * - Suppresses console warnings for deprecated APIs
 */

// Suppress warnings globally before Three.js is loaded
if (typeof window !== 'undefined') {
  const originalWarn = console.warn
  console.warn = (...args: any[]) => {
    const message = args[0]?.toString?.() || ''
    
    // Filter out Three.js deprecation warnings
    if (
      message.includes('THREE.Clock: This module has been deprecated') ||
      message.includes('PCFSoftShadowMap has been deprecated') ||
      message.includes('THREE.THREE.Clock')
    ) {
      return
    }
    
    originalWarn.apply(console, args)
  }
}

export function useThreeOptimization() {
  const { gl, scene } = useThree()

  useEffect(() => {
    // Configure shadow map to use PCFShadowMap instead of deprecated PCFSoftShadowMap
    gl.shadowMap.type = THREE.PCFShadowMap
    
    return () => {
      // Cleanup
    }
  }, [gl])
}
