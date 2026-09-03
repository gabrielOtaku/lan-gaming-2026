import React, { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import { SkeletonUtils } from 'three-stdlib';
import * as THREE from 'three';

// ── Optimized glTF character/vehicle models (see public/models/) ────────────
// Raw Sketchfab downloads (up to 425MB total) were compressed offline with
// gltf-transform (meshopt + webp, unused animations pruned) down to ~31MB.
// Scale factors below were measured from each model's own bounding box so
// every asset reads at a comparable in-scene size despite wildly different
// source unit conventions (millimeters vs. centimeters vs. meters).

export const MODEL_SCALE = {
  esquie: 0.55,
  sasCs2: 14,
  rifle: 24,
  dominus: 0.02,
  octane: 0.85,
};

function ClonedScene({ url, ...props }) {
  const { scene } = useGLTF(url);
  // SkeletonUtils.clone (not Object3D.clone) so skinned meshes (sas_cs2, rifle)
  // keep their bone bindings when the same glTF is instanced more than once.
  const cloned = useMemo(() => {
    const obj = SkeletonUtils.clone(scene);
    // meshopt-compressed geometry can carry a stale/empty bounding box/sphere
    // from the source export — this breaks both frustum culling (meshes
    // vanishing) and drei's <Bounds> auto-fit (which unions each mesh's
    // geometry.boundingBox to frame the camera, silently ignoring anything
    // with stale bounds). Disable culling and force a fresh recompute.
    obj.traverse((child) => {
      if (child.isMesh) {
        child.frustumCulled = false;
        child.geometry.computeBoundingBox();
        child.geometry.computeBoundingSphere();
      }
    });
    return obj;
  }, [scene]);
  return <primitive object={cloned} {...props} />;
}

export function EsquieModel(props) {
  return <ClonedScene url="/models/esquie.glb" scale={MODEL_SCALE.esquie} {...props} />;
}

export function SasCs2Model(props) {
  return <ClonedScene url="/models/sas_cs2.glb" scale={MODEL_SCALE.sasCs2} {...props} />;
}

export function RifleModel(props) {
  return <ClonedScene url="/models/rifle_awp.glb" scale={MODEL_SCALE.rifle} {...props} />;
}

export function DominusModel(props) {
  return <ClonedScene url="/models/dominus.glb" scale={MODEL_SCALE.dominus} {...props} />;
}

export function OctaneModel(props) {
  return <ClonedScene url="/models/octane.glb" scale={MODEL_SCALE.octane} {...props} />;
}

// ── Simple stylized "Foundation brick" — the Foundation logo on a gold-trimmed slab ──
export function FoundationBrick({ logoTexture, ...props }) {
  const texture = useMemo(() => {
    if (!logoTexture) return null;
    const tex = new THREE.TextureLoader().load(logoTexture);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, [logoTexture]);

  return (
    <group {...props}>
      <mesh>
        <boxGeometry args={[1, 1.3, 0.12]} />
        <meshStandardMaterial color="#0D1117" roughness={0.4} metalness={0.3} />
      </mesh>
      <mesh position={[0, 0, 0.065]}>
        <planeGeometry args={[0.82, 1.06]} />
        <meshStandardMaterial map={texture} transparent roughness={0.5} metalness={0.1} toneMapped={false} />
      </mesh>
      {/* Gold edge trim */}
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(1, 1.3, 0.12)]} />
        <lineBasicMaterial color="#FFD700" />
      </lineSegments>
    </group>
  );
}
