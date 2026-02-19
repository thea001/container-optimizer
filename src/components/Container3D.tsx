import React, { useRef, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Grid, Environment, Text } from "@react-three/drei";
import * as THREE from "three";
import { useContainerStore } from "../store/containerStore";
import { Box } from "../types";

interface BoxMeshProps {
  box: Box;
}

const BoxMesh: React.FC<BoxMeshProps> = ({ box }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.frustumCulled = false;
      // Add slight offset to prevent z-fighting
      meshRef.current.position.x += 0.001;
      meshRef.current.position.y += 0.001;
      meshRef.current.position.z += 0.001;
    }
  }, []);

  if (!box.position) return null;

  return (
    <mesh
      ref={meshRef}
      position={[box.position.x, box.position.y, box.position.z]}
      rotation={box.rotation === 90 ? [0, Math.PI / 2, 0] : [0, 0, 0]}
      frustumCulled={false}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[box.length, box.height, box.width]} />
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
  const { container } = useContainerStore();

  if (!container) return null;

  const containerY = container.height / 2;

  // Label positions and styles
  const labelStyle = {
    fontSize: 0.3,
    color: "#333333",
    fontWeight: "bold" as const,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    padding: "0.1",
    borderWidth: 0.5,
    borderColor: "#999999",
  };

  return (
    <group position={[container.length / 2, containerY, container.width / 2]}>
      {/* Main wireframe */}
      <lineSegments frustumCulled={false}>
        <edgesGeometry
          args={[
            new THREE.BoxGeometry(
              container.length,
              container.height,
              container.width,
            ),
          ]}
        />
        <lineBasicMaterial color="#333333" linewidth={2} />
      </lineSegments>

      {/* Alternative: Dimension labels on faces */}
      {/* Length on front face */}
      <Text
        position={[0, -container.height / 2 + 0.3, -container.width / 2 - 0.1]}
        fontSize={0.25}
        color="#dc2626"
        outlineWidth={0.02}
        outlineColor="white"
        anchorX="center"
        anchorY="middle"
        frustumCulled={false}
      >
        Length: {container.length.toFixed(1)}m
      </Text>

      {/* Height on left face */}
      <Text
        position={[-container.length / 2 - 0.1, 0, 0]}
        rotation={[0, Math.PI / 2, 0]}
        fontSize={0.25}
        color="#2563eb"
        outlineWidth={0.02}
        outlineColor="white"
        anchorX="center"
        anchorY="middle"
        frustumCulled={false}
      >
        Height: {container.height.toFixed(1)}m
      </Text>

      {/* Width on right face */}
      <Text
        position={[container.length / 2 + 0.1, 0, 0]}
        rotation={[0, -Math.PI / 2, 0]}
        fontSize={0.25}
        color="#16a34a"
        outlineWidth={0.02}
        outlineColor="white"
        anchorX="center"
        anchorY="middle"
        frustumCulled={false}
      >
        Width: {container.width.toFixed(1)}m
      </Text>

      {/* Corner markers with coordinates */}
      <Text
        position={[
          -container.length / 2,
          -container.height / 2,
          -container.width / 2,
        ]}
        fontSize={0.2}
        color="#666666"
        outlineWidth={0.02}
        outlineColor="white"
        anchorX="left"
        anchorY="bottom"
        frustumCulled={false}
      >
        (0,0,0)
      </Text>

      <Text
        position={[
          container.length / 2,
          -container.height / 2,
          -container.width / 2,
        ]}
        fontSize={0.2}
        color="#666666"
        outlineWidth={0.02}
        outlineColor="white"
        anchorX="right"
        anchorY="bottom"
        frustumCulled={false}
      >
        X
      </Text>

      <Text
        position={[
          -container.length / 2,
          container.height / 2,
          -container.width / 2,
        ]}
        fontSize={0.2}
        color="#666666"
        outlineWidth={0.02}
        outlineColor="white"
        anchorX="left"
        anchorY="top"
        frustumCulled={false}
      >
        Y
      </Text>

      <Text
        position={[
          -container.length / 2,
          -container.height / 2,
          container.width / 2,
        ]}
        fontSize={0.2}
        color="#666666"
        outlineWidth={0.02}
        outlineColor="white"
        anchorX="left"
        anchorY="bottom"
        frustumCulled={false}
      >
        Z
      </Text>
    </group>
  );
};

const GroundGrid: React.FC = () => {
  return (
    <>
      <Grid
        args={[30, 30]}
        cellSize={1}
        cellThickness={0.5}
        cellColor="#e5e7eb"
        sectionSize={5}
        sectionThickness={1}
        sectionColor="#d1d5db"
        fadeDistance={50}
        fadeStrength={1}
        followCamera={false}
        position={[0, 0, 0]}
      />
    </>
  );
};

export const Container3D: React.FC = () => {
  const { container, boxes } = useContainerStore();

  const cameraPosition = container
    ? [container.length, container.height * 1.2, container.width * 1.5]
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
          powerPreference: "high-performance",
        }}
        style={{ background: "white" }}
        onCreated={({ gl }) => {
          gl.setClearColor("white"); // Set clear color to white
        }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 10, 5]} intensity={0.8} castShadow />
        <directionalLight position={[-5, 5, 5]} intensity={0.4} castShadow />
        <directionalLight position={[0, 10, -5]} intensity={0.3} />
        {container && (
          <pointLight
            position={[
              container.length / 2,
              container.height / 2,
              container.width / 2,
            ]}
            intensity={0.5}
          />
        )}

        <GroundGrid />

        {container && (
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
            container
              ? [
                  container.length / 2,
                  container.height / 2,
                  container.width / 2,
                ]
              : [0, 0, 0]
          }
        />
      </Canvas>
    </div>
  );
};
