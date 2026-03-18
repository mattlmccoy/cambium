"use client";

import { useState, useRef, useCallback, Suspense, useMemo, useEffect, type RefObject } from "react";
import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  ContactShadows,
  Environment,
  Grid,
  useGLTF,
  Html,
} from "@react-three/drei";
import * as THREE from "three";

// ─── Types ──────────────────────────────────────────────────────

type ProductSlug = "side-table" | "table" | "chair" | "shelf";

interface ModelStats {
  meshCount: number;
  vertexCount: number;
  triangleCount: number;
  materialCount: number;
  nodeCount: number;
  boundingBox: THREE.Box3;
  fileSize: number;
}

interface MaterialOverrides {
  color: string;
  metalness: number;
  roughness: number;
  wireframe: boolean;
}

interface ConversionResult {
  glbBlob: Blob;
  glbUrl: string;
  originalSize: number;
  optimizedSize: number;
  filename: string;
}

type PipelineStatus =
  | { stage: "idle" }
  | { stage: "reading" }
  | { stage: "optimizing" }
  | { stage: "writing" }
  | { stage: "done"; result: ConversionResult }
  | { stage: "error"; message: string };

interface OrientationPreset {
  label: string;
  rotation: [number, number, number];
}

interface CoreModelMeta {
  productSlug: ProductSlug;
  approvedAt: string;
  orientationEuler: [number, number, number];
  boundingBox: { min: { x: number; y: number; z: number }; max: { x: number; y: number; z: number } };
  fixedDimensions: { width: number; height: number; depth: number };
  originalFilename: string;
  optimizedSizeBytes: number;
  version: number;
}

// ─── Constants ──────────────────────────────────────────────────

const ORIENTATION_PRESETS: OrientationPreset[] = [
  { label: "Default (Y up)", rotation: [0, 0, 0] },
  { label: "+X down", rotation: [0, 0, Math.PI / 2] },
  { label: "\u2212X down", rotation: [0, 0, -Math.PI / 2] },
  { label: "+Z down", rotation: [Math.PI / 2, 0, 0] },
  { label: "\u2212Z down", rotation: [-Math.PI / 2, 0, 0] },
  { label: "Flipped (Y down)", rotation: [Math.PI, 0, 0] },
];

const PRODUCT_OPTIONS: { slug: ProductSlug; label: string }[] = [
  { slug: "side-table", label: "Side Table" },
  { slug: "table", label: "Table" },
  { slug: "chair", label: "Chair" },
  { slug: "shelf", label: "Shelf" },
];

// ─── In-Browser glTF → GLB Conversion ──────────────────────────

async function convertGltfToGlb(
  files: FileList,
  primaryFile: File
): Promise<ConversionResult> {
  const { WebIO } = await import("@gltf-transform/core");
  const { ALL_EXTENSIONS } = await import("@gltf-transform/extensions");
  const { dedup, weld, quantize } = await import("@gltf-transform/functions");

  const io = new WebIO().registerExtensions(ALL_EXTENSIONS);

  const originalSize = primaryFile.size;
  const baseName = primaryFile.name.replace(/\.(gltf|glb)$/i, "");

  // If it's already a GLB, read directly
  if (primaryFile.name.endsWith(".glb")) {
    const buffer = await primaryFile.arrayBuffer();
    const document = await io.readBinary(new Uint8Array(buffer) as unknown as Uint8Array);

    await document.transform(dedup(), weld(), quantize());

    const optimizedBinary = await io.writeBinary(document);
    const blob = new Blob([optimizedBinary], { type: "model/gltf-binary" });
    const url = URL.createObjectURL(blob);

    return {
      glbBlob: blob,
      glbUrl: url,
      originalSize,
      optimizedSize: blob.size,
      filename: `${baseName}.glb`,
    };
  }

  // For glTF: build a virtual filesystem from all dropped files
  const fileMap: Record<string, Uint8Array> = {};
  for (let i = 0; i < files.length; i++) {
    const f = files[i];
    const buffer = await f.arrayBuffer();
    fileMap[f.name] = new Uint8Array(buffer);
  }

  const gltfJson = JSON.parse(new TextDecoder().decode(fileMap[primaryFile.name]));

  const resolveURI = (uri: string): Uint8Array => {
    if (uri.startsWith("data:")) {
      const base64 = uri.split(",")[1];
      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      return bytes;
    }
    const decoded = decodeURIComponent(uri);
    const name = decoded.split("/").pop() ?? decoded;
    if (fileMap[name]) return fileMap[name];
    if (fileMap[decoded]) return fileMap[decoded];
    throw new Error(`Referenced file not found: ${uri}. Make sure to drop all related files together.`);
  };

  const resources: Record<string, Uint8Array> = {};

  if (gltfJson.buffers) {
    for (const buffer of gltfJson.buffers) {
      if (buffer.uri && !buffer.uri.startsWith("data:")) {
        resources[buffer.uri] = resolveURI(buffer.uri);
      }
    }
  }

  if (gltfJson.images) {
    for (const image of gltfJson.images) {
      if (image.uri && !image.uri.startsWith("data:")) {
        resources[image.uri] = resolveURI(image.uri);
      }
    }
  }

  const document = await io.readJSON({ json: gltfJson, resources: resources as Record<string, Uint8Array<ArrayBuffer>> });

  await document.transform(dedup(), weld(), quantize());

  const glbBinary = await io.writeBinary(document);
  const blob = new Blob([glbBinary], { type: "model/gltf-binary" });
  const url = URL.createObjectURL(blob);

  return {
    glbBlob: blob,
    glbUrl: url,
    originalSize,
    optimizedSize: blob.size,
    filename: `${baseName}.glb`,
  };
}

// ─── Model Viewer Scene ─────────────────────────────────────────

function ModelScene({
  url,
  materialOverrides,
  showAxes,
  orientation,
  onOrientationChange,
  onStats,
}: {
  url: string;
  materialOverrides: MaterialOverrides;
  showAxes: boolean;
  orientation: [number, number, number];
  onOrientationChange: (euler: [number, number, number]) => void;
  onStats: (stats: ModelStats) => void;
}) {
  const { scene } = useGLTF(url);
  const orientationGroupRef = useRef<THREE.Group>(null);

  const clonedScene = useMemo(() => {
    const clone = scene.clone(true);
    let meshCount = 0;
    let vertexCount = 0;
    let triangleCount = 0;
    const materials = new Set<string>();
    let nodeCount = 0;

    clone.traverse((child) => {
      nodeCount++;
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        meshCount++;

        const geo = mesh.geometry;
        if (geo.index) {
          triangleCount += geo.index.count / 3;
        } else if (geo.attributes.position) {
          triangleCount += geo.attributes.position.count / 3;
        }
        if (geo.attributes.position) {
          vertexCount += geo.attributes.position.count;
        }

        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        mats.forEach((m) => materials.add(m.uuid));

        mesh.material = new THREE.MeshStandardMaterial({
          color: materialOverrides.color,
          metalness: materialOverrides.metalness,
          roughness: materialOverrides.roughness,
          wireframe: materialOverrides.wireframe,
        });
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });

    const box = new THREE.Box3().setFromObject(clone);

    const center = new THREE.Vector3();
    box.getCenter(center);
    clone.position.sub(center);
    clone.position.y += box.getSize(new THREE.Vector3()).y / 2;

    return {
      clone,
      stats: {
        meshCount,
        vertexCount,
        triangleCount,
        materialCount: materials.size,
        nodeCount,
        boundingBox: box,
        fileSize: 0,
      },
    };
  }, [scene, materialOverrides.color, materialOverrides.metalness, materialOverrides.roughness, materialOverrides.wireframe]);

  useEffect(() => {
    onStats(clonedScene.stats);
  }, [clonedScene.stats, onStats]);

  const scale = useMemo(() => {
    const size = new THREE.Vector3();
    clonedScene.stats.boundingBox.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z, 0.001);
    return 1.5 / maxDim;
  }, [clonedScene.stats.boundingBox]);

  // Click a face → rotate so that face becomes the floor
  const handleFaceClick = useCallback(
    (event: { stopPropagation: () => void; face?: THREE.Face | null; object: THREE.Object3D }) => {
      event.stopPropagation();
      if (!event.face) return;

      // Get face normal in world space
      const worldNormal = event.face.normal.clone();
      (event.object as THREE.Mesh).updateMatrixWorld();
      const normalMatrix = new THREE.Matrix3().getNormalMatrix(event.object.matrixWorld);
      worldNormal.applyMatrix3(normalMatrix).normalize();

      // We want to rotate so this face normal points DOWN (−Y)
      // setFromUnitVectors gives us the rotation from worldNormal → downVec
      const downVec = new THREE.Vector3(0, -1, 0);
      const correction = new THREE.Quaternion().setFromUnitVectors(worldNormal, downVec);

      // Compose with current orientation: new = correction × current
      const currentQuat = new THREE.Quaternion().setFromEuler(
        new THREE.Euler(orientation[0], orientation[1], orientation[2])
      );
      const newQuat = correction.multiply(currentQuat);

      const newEuler = new THREE.Euler().setFromQuaternion(newQuat);
      onOrientationChange([newEuler.x, newEuler.y, newEuler.z]);
    },
    [orientation, onOrientationChange]
  );

  return (
    <group scale={scale}>
      {/* Orientation wrapper — rotates model to chosen "floor" */}
      <group ref={orientationGroupRef} rotation={orientation}>
        <primitive
          object={clonedScene.clone}
          onClick={handleFaceClick}
          onPointerOver={() => { document.body.style.cursor = "pointer"; }}
          onPointerOut={() => { document.body.style.cursor = "auto"; }}
        />
      </group>
      {showAxes && <axesHelper args={[500]} />}
    </group>
  );
}

function LoadingIndicator() {
  return (
    <Html center>
      <div className="bg-white px-4 py-2 rounded-lg shadow-lg text-sm text-zinc-600">
        Loading model...
      </div>
    </Html>
  );
}

function EmptyScene({ showGrid }: { showGrid: boolean }) {
  return (
    <>
      <Html center>
        <div className="text-center text-zinc-400">
          <div className="text-4xl mb-2">📦</div>
          <div className="text-sm font-medium">Drop a glTF or GLB file here</div>
          <div className="text-xs mt-1 max-w-48">
            For glTF with external .bin files, drop all files together
          </div>
        </div>
      </Html>
      {showGrid && (
        <Grid
          args={[10, 10]}
          cellSize={0.5}
          cellThickness={0.5}
          cellColor="#d4d4d8"
          sectionSize={2}
          sectionThickness={1}
          sectionColor="#a1a1aa"
          fadeDistance={10}
          fadeStrength={1}
          infiniteGrid
        />
      )}
    </>
  );
}

// ─── Main Page ──────────────────────────────────────────────────

export default function DevViewerPage() {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [pipeline, setPipeline] = useState<PipelineStatus>({ stage: "idle" });
  const [stats, setStats] = useState<ModelStats | null>(null);
  const [showAxes, setShowAxes] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [isDragOver, setIsDragOver] = useState(false);
  const [envPreset, setEnvPreset] = useState<
    "studio" | "warehouse" | "city" | "sunset" | "dawn" | "night" | "apartment"
  >("studio");
  const [materialOverrides, setMaterialOverrides] = useState<MaterialOverrides>({
    color: "#1a1a1a",
    metalness: 0.85,
    roughness: 0.35,
    wireframe: false,
  });
  const [orientation, setOrientation] = useState<[number, number, number]>([0, 0, 0]);
  const [approveSlug, setApproveSlug] = useState<ProductSlug>("side-table");
  const [approveVersion, setApproveVersion] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFiles = useCallback(
    async (files: FileList) => {
      const primary = Array.from(files).find(
        (f) => f.name.endsWith(".gltf") || f.name.endsWith(".glb")
      );
      if (!primary) {
        setPipeline({ stage: "error", message: "No .gltf or .glb file found in the dropped files." });
        return;
      }

      if (previewUrl) URL.revokeObjectURL(previewUrl);
      if (pipeline.stage === "done") URL.revokeObjectURL(pipeline.result.glbUrl);

      try {
        setPipeline({ stage: "reading" });
        await new Promise((r) => setTimeout(r, 50));
        setPipeline({ stage: "optimizing" });

        const result = await convertGltfToGlb(files, primary);

        setPipeline({ stage: "done", result });
        setPreviewUrl(result.glbUrl);
        // Reset orientation for new model
        setOrientation([0, 0, 0]);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Unknown error during conversion";
        setPipeline({ stage: "error", message: msg });
      }
    },
    [previewUrl, pipeline]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      if (e.dataTransfer.files.length > 0) {
        processFiles(e.dataTransfer.files);
      }
    },
    [processFiles]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        processFiles(e.target.files);
      }
    },
    [processFiles]
  );

  const handleClear = useCallback(() => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (pipeline.stage === "done") URL.revokeObjectURL(pipeline.result.glbUrl);
    setPreviewUrl(null);
    setPipeline({ stage: "idle" });
    setStats(null);
    setOrientation([0, 0, 0]);
  }, [previewUrl, pipeline]);

  const handleDownload = useCallback(() => {
    if (pipeline.stage !== "done") return;
    const a = document.createElement("a");
    a.href = pipeline.result.glbUrl;
    a.download = pipeline.result.filename;
    a.click();
  }, [pipeline]);

  const handleApprove = useCallback(() => {
    if (pipeline.stage !== "done" || !stats) return;

    const box = stats.boundingBox;
    const size = new THREE.Vector3();
    box.getSize(size);

    const meta: CoreModelMeta = {
      productSlug: approveSlug,
      approvedAt: new Date().toISOString(),
      orientationEuler: orientation,
      boundingBox: {
        min: { x: box.min.x, y: box.min.y, z: box.min.z },
        max: { x: box.max.x, y: box.max.y, z: box.max.z },
      },
      fixedDimensions: {
        width: Math.round(size.x * 10) / 10,
        height: Math.round(size.y * 10) / 10,
        depth: Math.round(size.z * 10) / 10,
      },
      originalFilename: pipeline.result.filename,
      optimizedSizeBytes: pipeline.result.optimizedSize,
      version: approveVersion,
    };

    const glbFilename = `${approveSlug}-core.glb`;
    const metaFilename = `${approveSlug}-core.meta.json`;

    // Download GLB
    const glbLink = document.createElement("a");
    glbLink.href = pipeline.result.glbUrl;
    glbLink.download = glbFilename;
    glbLink.click();

    // Download meta.json
    setTimeout(() => {
      const metaBlob = new Blob([JSON.stringify(meta, null, 2)], { type: "application/json" });
      const metaUrl = URL.createObjectURL(metaBlob);
      const metaLink = document.createElement("a");
      metaLink.href = metaUrl;
      metaLink.download = metaFilename;
      metaLink.click();
      URL.revokeObjectURL(metaUrl);
    }, 200);
  }, [pipeline, stats, approveSlug, approveVersion, orientation]);

  const handleStats = useCallback((newStats: ModelStats) => {
    setStats((prev) => ({
      ...newStats,
      fileSize: pipeline.stage === "done" ? pipeline.result.optimizedSize : prev?.fileSize ?? 0,
    }));
  }, [pipeline]);

  // Orientation helpers
  const rotateAxis = useCallback((axis: 0 | 1 | 2, degrees: number) => {
    setOrientation((prev) => {
      const next: [number, number, number] = [...prev];
      next[axis] += (degrees * Math.PI) / 180;
      return next;
    });
  }, []);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "\u2014";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const formatDim = (box: THREE.Box3) => {
    const size = new THREE.Vector3();
    box.getSize(size);
    return `${size.x.toFixed(1)} \u00d7 ${size.y.toFixed(1)} \u00d7 ${size.z.toFixed(1)}`;
  };

  const compressionRatio =
    pipeline.stage === "done"
      ? ((1 - pipeline.result.optimizedSize / pipeline.result.originalSize) * 100).toFixed(0)
      : null;

  const presets = {
    "Powder-coat black": { color: "#1a1a1a", metalness: 0.85, roughness: 0.35, wireframe: false },
    "Brushed steel": { color: "#8a8a8a", metalness: 0.9, roughness: 0.25, wireframe: false },
    "Matte white": { color: "#f5f5f5", metalness: 0.0, roughness: 0.9, wireframe: false },
    Wireframe: { color: "#3b82f6", metalness: 0.0, roughness: 0.5, wireframe: true },
    "Gold accent": { color: "#c4943b", metalness: 0.9, roughness: 0.2, wireframe: false },
  };

  const isProcessing = pipeline.stage === "reading" || pipeline.stage === "optimizing" || pipeline.stage === "writing";
  const hasModel = !!previewUrl;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-zinc-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-zinc-900">3D Model Viewer</h1>
            <p className="text-sm text-zinc-500">
              Drop a glTF from Onshape — converts to optimized GLB in your browser
            </p>
          </div>
          <div className="flex items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept=".glb,.gltf,.bin,.png,.jpg,.jpeg"
              multiple
              onChange={handleFileInput}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              className="px-4 py-2 bg-zinc-900 text-white text-sm rounded-lg hover:bg-zinc-800 transition-colors disabled:opacity-50"
            >
              Open Files
            </button>
            {pipeline.stage === "done" && (
              <button
                onClick={handleDownload}
                className="px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-500 transition-colors"
              >
                Download GLB
              </button>
            )}
            {(previewUrl || pipeline.stage !== "idle") && (
              <button
                onClick={handleClear}
                className="px-4 py-2 border border-zinc-300 text-sm rounded-lg hover:bg-zinc-50 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Pipeline status bar */}
      {pipeline.stage !== "idle" && pipeline.stage !== "done" && (
        <div
          className={`px-6 py-2 text-sm flex items-center gap-2 ${
            pipeline.stage === "error"
              ? "bg-red-50 text-red-700"
              : "bg-blue-50 text-blue-700"
          }`}
        >
          {isProcessing && (
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          )}
          {pipeline.stage === "reading" && "Reading glTF file..."}
          {pipeline.stage === "optimizing" && "Optimizing: dedup, weld, quantize..."}
          {pipeline.stage === "writing" && "Writing GLB..."}
          {pipeline.stage === "error" && pipeline.message}
        </div>
      )}

      {/* Conversion success bar */}
      {pipeline.stage === "done" && (
        <div className="px-6 py-2 text-sm bg-emerald-50 text-emerald-700 flex items-center gap-4">
          <span className="font-medium">Converted to GLB</span>
          <span>
            {formatSize(pipeline.result.originalSize)} →{" "}
            {formatSize(pipeline.result.optimizedSize)}
          </span>
          {compressionRatio && Number(compressionRatio) > 0 && (
            <span className="bg-emerald-100 px-2 py-0.5 rounded text-xs font-medium">
              {compressionRatio}% smaller
            </span>
          )}
          {pipeline.result.optimizedSize > 500 * 1024 ? (
            <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-xs font-medium">
              Over 500KB target
            </span>
          ) : (
            <span className="bg-emerald-100 px-2 py-0.5 rounded text-xs font-medium">
              Under 500KB target
            </span>
          )}
        </div>
      )}

      <div className="flex-1 flex min-h-0">
        {/* Canvas */}
        <div
          className={`flex-1 relative transition-colors ${
            isDragOver ? "bg-blue-50 ring-2 ring-inset ring-blue-300" : "bg-zinc-50"
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
        >
          {isDragOver && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-blue-50/80">
              <div className="text-center">
                <div className="text-4xl mb-2">📥</div>
                <div className="text-sm font-medium text-blue-600">Drop glTF / GLB files</div>
                <div className="text-xs text-blue-500 mt-1">
                  Include .bin and texture files if separate
                </div>
              </div>
            </div>
          )}

          <Canvas
            shadows
            camera={{ position: [2, 1.5, 2], fov: 40 }}
            gl={{ antialias: true, alpha: false, toneMapping: THREE.ACESFilmicToneMapping }}
            onCreated={({ gl }) => {
              gl.setClearColor("#f8f8f8");
              gl.toneMappingExposure = 1.2;
            }}
          >
            <Suspense fallback={<LoadingIndicator />}>
              {previewUrl ? (
                <ModelScene
                  url={previewUrl}
                  materialOverrides={materialOverrides}
                  showAxes={showAxes}
                  orientation={orientation}
                  onOrientationChange={setOrientation}
                  onStats={handleStats}
                />
              ) : (
                <EmptyScene showGrid={showGrid} />
              )}
              <Environment preset={envPreset} />
            </Suspense>

            <ambientLight intensity={0.3} />
            <directionalLight
              position={[5, 5, 5]}
              intensity={1.5}
              castShadow
              shadow-mapSize-width={2048}
              shadow-mapSize-height={2048}
              color="#fff5e6"
            />
            <directionalLight position={[-3, 3, -2]} intensity={0.5} color="#e8f0ff" />

            {showGrid && (
              <Grid
                args={[10, 10]}
                cellSize={0.5}
                cellThickness={0.5}
                cellColor="#d4d4d8"
                sectionSize={2}
                sectionThickness={1}
                sectionColor="#a1a1aa"
                fadeDistance={10}
                fadeStrength={1}
                infiniteGrid
              />
            )}

            <ContactShadows position={[0, -0.01, 0]} opacity={0.4} scale={5} blur={2} far={2} />
            <OrbitControls enablePan minDistance={0.3} maxDistance={10} />
          </Canvas>

          {/* File name badge */}
          {pipeline.stage === "done" && (
            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm text-sm font-medium text-zinc-700">
              {pipeline.result.filename}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="w-80 border-l border-zinc-200 overflow-y-auto bg-white">
          {/* Approve Core */}
          {hasModel && pipeline.stage === "done" && (
            <div className="p-4 border-b border-zinc-200 bg-blue-50">
              <h3 className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-3">
                Approve Core
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-zinc-600 mb-1 block">Product</label>
                  <select
                    value={approveSlug}
                    onChange={(e) => setApproveSlug(e.target.value as ProductSlug)}
                    className="w-full text-sm border border-zinc-300 rounded-lg px-3 py-1.5 bg-white"
                  >
                    {PRODUCT_OPTIONS.map((p) => (
                      <option key={p.slug} value={p.slug}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-zinc-600 mb-1 block">Version</label>
                  <input
                    type="number"
                    min={1}
                    value={approveVersion}
                    onChange={(e) => setApproveVersion(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full text-sm border border-zinc-300 rounded-lg px-3 py-1.5 bg-white"
                  />
                </div>
                <button
                  onClick={handleApprove}
                  className="w-full px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-500 transition-colors"
                >
                  Approve &amp; Download Bundle
                </button>
                <p className="text-[11px] text-zinc-500">
                  Downloads <code className="bg-zinc-100 px-1 rounded">{approveSlug}-core.glb</code> +{" "}
                  <code className="bg-zinc-100 px-1 rounded">{approveSlug}-core.meta.json</code> with the
                  current orientation baked in.
                </p>
              </div>
            </div>
          )}

          {/* Orientation */}
          {hasModel && (
            <div className="p-4 border-b border-zinc-200">
              <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
                Orientation
              </h3>
              <p className="text-[11px] text-zinc-500 mb-3">
                Click any face on the model to make it the floor, or use presets below.
              </p>
              <div className="space-y-3">
                {/* Presets */}
                <div className="grid grid-cols-2 gap-1.5">
                  {ORIENTATION_PRESETS.map((preset) => {
                    const isActive =
                      orientation[0] === preset.rotation[0] &&
                      orientation[1] === preset.rotation[1] &&
                      orientation[2] === preset.rotation[2];
                    return (
                      <button
                        key={preset.label}
                        onClick={() => setOrientation(preset.rotation)}
                        className={`px-2 py-1.5 rounded text-xs transition-colors ${
                          isActive
                            ? "bg-zinc-900 text-white"
                            : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                        }`}
                      >
                        {preset.label}
                      </button>
                    );
                  })}
                </div>

                {/* Fine-tune rotation */}
                <div className="pt-2 border-t border-zinc-100">
                  <span className="text-xs text-zinc-400 block mb-2">Fine-tune (90° steps)</span>
                  <div className="space-y-1.5">
                    {(["X", "Y", "Z"] as const).map((axis, idx) => (
                      <div key={axis} className="flex items-center gap-2">
                        <span className="text-xs font-mono text-zinc-500 w-4">{axis}</span>
                        <button
                          onClick={() => rotateAxis(idx as 0 | 1 | 2, -90)}
                          className="flex-1 px-2 py-1 bg-zinc-100 hover:bg-zinc-200 rounded text-xs text-zinc-600 transition-colors"
                        >
                          −90°
                        </button>
                        <button
                          onClick={() => rotateAxis(idx as 0 | 1 | 2, 90)}
                          className="flex-1 px-2 py-1 bg-zinc-100 hover:bg-zinc-200 rounded text-xs text-zinc-600 transition-colors"
                        >
                          +90°
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 text-[10px] text-zinc-400 font-mono">
                    [{orientation.map((r) => `${((r * 180) / Math.PI).toFixed(0)}°`).join(", ")}]
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="p-4 border-b border-zinc-200">
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
              Model Stats
            </h3>
            {stats ? (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-500">GLB Size</span>
                  <span className="font-medium text-zinc-900">
                    {pipeline.stage === "done"
                      ? formatSize(pipeline.result.optimizedSize)
                      : "\u2014"}
                    {pipeline.stage === "done" &&
                      pipeline.result.optimizedSize > 500 * 1024 && (
                        <span className="text-amber-500 ml-1" title="Over 500KB target">
                          !!
                        </span>
                      )}
                  </span>
                </div>
                {pipeline.stage === "done" && (
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Original</span>
                    <span className="font-medium text-zinc-400">
                      {formatSize(pipeline.result.originalSize)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-zinc-500">Meshes</span>
                  <span className="font-medium">{stats.meshCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Vertices</span>
                  <span className="font-medium">{stats.vertexCount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Triangles</span>
                  <span className="font-medium">{stats.triangleCount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Materials</span>
                  <span className="font-medium">{stats.materialCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Nodes</span>
                  <span className="font-medium">{stats.nodeCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Dimensions</span>
                  <span className="font-medium text-xs">{formatDim(stats.boundingBox)}</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-zinc-400">No model loaded</p>
            )}
          </div>

          {/* Material Presets */}
          <div className="p-4 border-b border-zinc-200">
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
              Material Presets
            </h3>
            <div className="space-y-1">
              {Object.entries(presets).map(([name, preset]) => (
                <button
                  key={name}
                  onClick={() => setMaterialOverrides(preset)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                    materialOverrides.color === preset.color &&
                    materialOverrides.metalness === preset.metalness &&
                    materialOverrides.wireframe === preset.wireframe
                      ? "bg-zinc-100 text-zinc-900 font-medium"
                      : "text-zinc-600 hover:bg-zinc-50"
                  }`}
                >
                  <div
                    className="w-4 h-4 rounded-full border border-zinc-300"
                    style={{ backgroundColor: preset.color }}
                  />
                  {name}
                </button>
              ))}
            </div>
          </div>

          {/* Material Controls */}
          <div className="p-4 border-b border-zinc-200">
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
              Material Controls
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-zinc-500 mb-1 block">Color</label>
                <input
                  type="color"
                  value={materialOverrides.color}
                  onChange={(e) =>
                    setMaterialOverrides((m) => ({ ...m, color: e.target.value }))
                  }
                  className="w-full h-8 rounded cursor-pointer"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-500 mb-1 flex justify-between">
                  <span>Metalness</span>
                  <span>{materialOverrides.metalness.toFixed(2)}</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={materialOverrides.metalness}
                  onChange={(e) =>
                    setMaterialOverrides((m) => ({
                      ...m,
                      metalness: parseFloat(e.target.value),
                    }))
                  }
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-500 mb-1 flex justify-between">
                  <span>Roughness</span>
                  <span>{materialOverrides.roughness.toFixed(2)}</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={materialOverrides.roughness}
                  onChange={(e) =>
                    setMaterialOverrides((m) => ({
                      ...m,
                      roughness: parseFloat(e.target.value),
                    }))
                  }
                  className="w-full"
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-zinc-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={materialOverrides.wireframe}
                  onChange={(e) =>
                    setMaterialOverrides((m) => ({ ...m, wireframe: e.target.checked }))
                  }
                  className="rounded"
                />
                Wireframe
              </label>
            </div>
          </div>

          {/* Scene Controls */}
          <div className="p-4 border-b border-zinc-200">
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
              Scene
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-zinc-500 mb-1 block">Environment</label>
                <select
                  value={envPreset}
                  onChange={(e) => setEnvPreset(e.target.value as typeof envPreset)}
                  className="w-full text-sm border border-zinc-300 rounded-lg px-3 py-1.5"
                >
                  <option value="studio">Studio</option>
                  <option value="warehouse">Warehouse</option>
                  <option value="city">City</option>
                  <option value="sunset">Sunset</option>
                  <option value="dawn">Dawn</option>
                  <option value="night">Night</option>
                  <option value="apartment">Apartment</option>
                </select>
              </div>
              <label className="flex items-center gap-2 text-sm text-zinc-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showAxes}
                  onChange={(e) => setShowAxes(e.target.checked)}
                  className="rounded"
                />
                Show Axes
              </label>
              <label className="flex items-center gap-2 text-sm text-zinc-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showGrid}
                  onChange={(e) => setShowGrid(e.target.checked)}
                  className="rounded"
                />
                Show Grid
              </label>
            </div>
          </div>

          {/* Pipeline Info */}
          <div className="p-4">
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
              How It Works
            </h3>
            <div className="text-xs text-zinc-500 space-y-2">
              <div className="space-y-1.5">
                <div className="flex items-start gap-2">
                  <span className="text-zinc-400 font-mono">1.</span>
                  <span>Export glTF from Onshape</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-zinc-400 font-mono">2.</span>
                  <span>Drop file(s) here — auto-optimizes to GLB</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-zinc-400 font-mono">3.</span>
                  <span>Orient model so it sits on the ground</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-zinc-400 font-mono">4.</span>
                  <span>Preview with different materials</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-zinc-400 font-mono">5.</span>
                  <span>Approve — downloads GLB + meta.json</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-zinc-400 font-mono">6.</span>
                  <span>Place in <code className="bg-zinc-100 px-1 rounded">apps/web/public/models/cores/</code></span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-zinc-100">
                <p className="text-zinc-400">
                  Target: &lt;500KB per Core model. One Core per product (4 total).
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
