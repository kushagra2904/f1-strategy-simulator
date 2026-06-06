import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  Lightformer,
  OrbitControls,
} from "@react-three/drei";
import type { Driver } from "../types/api";
import { F1Car } from "./F1Car";
import { CarModel } from "./CarModel";
import { ErrorBoundary } from "./ErrorBoundary";
import { TrackRibbon } from "./TrackRibbon";
import { DriverSelect } from "./DriverSelect";

// Default export so it can be React.lazy()-loaded — keeps three.js out of the
// main bundle until the Assets tab is opened.
export default function AssetGallery({
  drivers,
  driverId,
  onDriverChange,
  driver,
}: {
  drivers: Driver[];
  driverId: string;
  onDriverChange: (id: string) => void;
  driver: Driver | null;
}) {
  const color = driver?.team_color ?? "#e10600";

  return (
    <section className="glass overflow-hidden">
      <header className="flex flex-wrap items-end justify-between gap-4 p-5">
        <div>
          <p className="hud-label">3D Asset Gallery</p>
          <h2 className="font-display text-xl font-bold text-on-surface">
            {driver ? driver.team : "Car"}
          </h2>
        </div>
        <div className="w-full max-w-xs">
          <DriverSelect
            drivers={drivers}
            value={driverId}
            onChange={onDriverChange}
          />
        </div>
      </header>

      <div className="h-[540px] w-full">
        <Canvas shadows camera={{ position: [4.5, 2.6, 5.5], fov: 42 }}>
          <color attach="background" args={["#0b0b12"]} />
          <ambientLight intensity={0.35} />
          <directionalLight
            position={[5, 8, 5]}
            intensity={1.2}
            castShadow
            shadow-mapSize={[1024, 1024]}
          />
          {/* Studio reflections built from emissive panels — no HDRI/network. */}
          <Environment resolution={256}>
            <Lightformer
              intensity={3}
              position={[0, 6, 2]}
              scale={[8, 8, 1]}
              color="#ffffff"
            />
            <Lightformer
              intensity={1.6}
              position={[-5, 3, -4]}
              scale={[6, 6, 1]}
              color="#9fc4ff"
            />
            <Lightformer
              intensity={1.6}
              position={[5, 2, 4]}
              scale={[6, 6, 1]}
              color="#ffffff"
            />
          </Environment>

          {/* Use a real /models/f1-car.glb if present, else the procedural car. */}
          <ErrorBoundary fallback={<F1Car color={color} />}>
            <Suspense fallback={<F1Car color={color} />}>
              <CarModel />
            </Suspense>
          </ErrorBoundary>
          <TrackRibbon color={color} />

          <ContactShadows
            position={[0, 0, 0]}
            opacity={0.55}
            blur={2.4}
            far={12}
            scale={20}
          />
          <OrbitControls
            enablePan={false}
            minDistance={4}
            maxDistance={14}
            minPolarAngle={0.2}
            maxPolarAngle={Math.PI / 2.05}
            autoRotate
            autoRotateSpeed={0.6}
          />
        </Canvas>
      </div>

      <footer className="p-4">
        <p className="text-xs text-on-surface-variant">
          Custom 3D car in the selected team's livery — drag to orbit, scroll to
          zoom.
        </p>
      </footer>
    </section>
  );
}
