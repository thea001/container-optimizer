import React, { useRef, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Grid, Text } from "@react-three/drei";
import * as THREE from "three";
import { useContainerStore } from "../store/containerStore";
import { Box } from "../types";

interface BoxMeshProps {
  box: Box;
}

const BoxMesh: React.FC<BoxMeshProps> = ({ box }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { scaledDimensions, getVisualPosition } = useContainerStore();

  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.frustumCulled = false;
    }
  }, []);

  if (!box.position || !scaledDimensions) return null;

  // Get visual position (scaled up for visibility)
  const visualPos = getVisualPosition(box);
  if (!visualPos) return null;

  return (
    <mesh
      ref={meshRef}
      position={[visualPos.x, visualPos.y, visualPos.z]}
      rotation={box.rotation === 90 ? [0, Math.PI / 2, 0] : [0, 0, 0]}
      frustumCulled={false}
      castShadow
      receiveShadow
    >
      <boxGeometry
        args={[
          box.length * scaledDimensions.scaleFactor,
          box.height * scaledDimensions.scaleFactor,
          box.width * scaledDimensions.scaleFactor,
        ]}
      />
      <meshStandardMaterial
        color={box.color}
        transparent
        opacity={0.9}
        emissive={box.color}
        emissiveIntensity={0.1}
        side={THREE.DoubleSide}
        roughness={0.3}
        metalness={0.1}
      />
      <Edges color="black" />
    </mesh>
  );
};

const Edges: React.FC<{ color: string }> = ({ color }) => {
  const mesh = useRef<THREE.LineSegments>(null);

  return (
    <lineSegments ref={mesh} frustumCulled={false}>
      <edgesGeometry attach="geometry" />
      <lineBasicMaterial attach="material" color={color} linewidth={1} />
    </lineSegments>
  );
};

const ContainerWireframe: React.FC = () => {
  const { container, scaledDimensions } = useContainerStore();

  if (!container || !scaledDimensions) return null;

  const visualY = scaledDimensions.visualHeight / 2;

  // Helper function to create text with background using HTML div
  const createTextWithBackground = (
    text: string,
    position: [number, number, number],
    color: string,
    rotation?: [number, number, number],
  ) => {
    return (
      <Text
        position={position}
        rotation={rotation}
        fontSize={0.3}
        color={color}
        anchorX="center"
        anchorY="middle"
        fontWeight="bold"
        outlineWidth={0.02}
        outlineColor="white"
        frustumCulled={false}
      >
        {text}
      </Text>
    );
  };

  return (
    <group
      position={[
        scaledDimensions.visualLength / 2,
        visualY,
        scaledDimensions.visualWidth / 2,
      ]}
    >
      {/* Main wireframe */}
      <lineSegments frustumCulled={false}>
        <edgesGeometry
          args={[
            new THREE.BoxGeometry(
              scaledDimensions.visualLength,
              scaledDimensions.visualHeight,
              scaledDimensions.visualWidth,
            ),
          ]}
        />
        <lineBasicMaterial color="#333333" linewidth={2} />
      </lineSegments>

      {/* Dimension Labels with outline instead of background */}

      {/* Length Label - Bottom Front */}
      <Text
        position={[
          0,
          -scaledDimensions.visualHeight / 2 - 0.4,
          -scaledDimensions.visualWidth / 2 - 0.4,
        ]}
        fontSize={2}
        color="#dc2626"
        fontWeight="bold"
        outlineWidth={0.03}
        outlineColor="white"
        anchorX="center"
        anchorY="middle"
        frustumCulled={false}
      >
        L: {container.length.toFixed(1)} cm
      </Text>

      {/* Height Label - Left Side */}
      <Text
        position={[
          -scaledDimensions.visualLength / 2 - 0.4,
          0,
          -scaledDimensions.visualWidth / 2 - 0.4,
        ]}
        fontSize={2}
        color="#2563eb"
        fontWeight="bold"
        outlineWidth={0.03}
        outlineColor="white"
        rotation={[0, Math.PI / 2, 0]}
        anchorX="center"
        anchorY="middle"
        frustumCulled={false}
      >
        H: {container.height.toFixed(1)} cm
      </Text>

      {/* Width Label - Right Side */}
      <Text
        position={[
          scaledDimensions.visualLength / 2 + 0.4,
          0,
          scaledDimensions.visualWidth / 2 + 0.4,
        ]}
        fontSize={2}
        color="#16a34a"
        fontWeight="bold"
        outlineWidth={0.03}
        outlineColor="white"
        rotation={[0, -Math.PI / 2, 0]}
        anchorX="center"
        anchorY="middle"
        frustumCulled={false}
      >
        W: {container.width.toFixed(1)} cm
      </Text>

      {/* Container Volume - Top Center */}
      <Text
        position={[0, scaledDimensions.visualHeight / 2 + 0.5, 0]}
        fontSize={2}
        color="#2563eb"
        fontWeight="bold"
        outlineWidth={0.03}
        outlineColor="white"
        anchorX="center"
        anchorY="middle"
        frustumCulled={false}
      >
        📦 {(container.length * container.height * container.width).toFixed(0)}{" "}
        cm³
      </Text>

      {/* Scale indicator */}
      <Text
        position={[0, -scaledDimensions.visualHeight / 2 - 0.8, 0]}
        fontSize={2}
        color="#6b7280"
        outlineWidth={0.02}
        outlineColor="white"
        anchorX="center"
        anchorY="middle"
        frustumCulled={false}
      >
        Scale: {scaledDimensions.scaleFactor.toFixed(1)}x
      </Text>

      {/* Corner marker at origin */}
      <Text
        position={[
          -scaledDimensions.visualLength / 2,
          -scaledDimensions.visualHeight / 2,
          -scaledDimensions.visualWidth / 2,
        ]}
        fontSize={0.2}
        color="#9ca3af"
        outlineWidth={0.02}
        outlineColor="white"
        anchorX="right"
        anchorY="bottom"
        frustumCulled={false}
      >
        (0,0,0)
      </Text>
    </group>
  );
};

const GroundGrid: React.FC = () => {
  return (
    <>
      <Grid
        args={[50, 50]}
        cellSize={1}
        cellThickness={0.5}
        cellColor="#e5e7eb"
        sectionSize={5}
        sectionThickness={1}
        sectionColor="#d1d5db"
        fadeDistance={100}
        fadeStrength={1}
        followCamera={false}
        position={[0, 0, 0]}
      />
    </>
  );
};

export const Container3D: React.FC = () => {
  const { container, scaledDimensions, boxes } = useContainerStore();

  // Calculate camera position based on visual size
  const cameraPosition = scaledDimensions
    ? [
        scaledDimensions.visualLength * 1.2,
        scaledDimensions.visualHeight * 1.2,
        scaledDimensions.visualWidth * 1.5,
      ]
    : [10, 10, 10];

  return (
    <div className="w-full h-[600px] bg-white rounded-lg shadow-inner">
      <Canvas
        camera={{
          position: cameraPosition as [number, number, number],
          fov: 45,
          near: 0.01,
          far: 1000,
        }}
        gl={{
          preserveDrawingBuffer: true,
          alpha: false,
          antialias: true,
        }}
        style={{ background: "white" }}
        onCreated={({ gl }) => {
          gl.setClearColor("white");
        }}
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 10, 5]} intensity={0.8} castShadow />
        <directionalLight position={[-5, 5, 5]} intensity={0.4} castShadow />
        <directionalLight position={[0, 10, -5]} intensity={0.3} />

        <GroundGrid />

        {container && scaledDimensions && (
          <>
            <ContainerWireframe />
            {boxes
              .filter((box) => box.placed && box.position)
              .map((box) => (
                <BoxMesh key={box.id} box={box} />
              ))}
          </>
        )}

        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={0}
          target={
            scaledDimensions
              ? [
                  scaledDimensions.visualLength / 2,
                  scaledDimensions.visualHeight / 2,
                  scaledDimensions.visualWidth / 2,
                ]
              : [0, 0, 0]
          }
        />
      </Canvas>
    </div>
  );
};
