import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { ASSETS } from '../assets/brandAssets';
import { RotateCw, ZoomIn, ZoomOut, Crosshair, X, Shield, AlertTriangle, Video, Navigation } from 'lucide-react';

export interface Marker3DData {
  id: string;
  name: string;
  type: 'unidade' | 'alerta' | 'ronda' | 'camera';
  city: string;
  state: string;
  desc: string;
  details: string;
  status: string;
  // Normalized UV coordinates on the Brazil map image [0..1]
  u: number;
  v: number;
}

// Markers precisely anchored to Brazilian states on the map
const MARKERS_DATA: Marker3DData[] = [
  {
    id: 'unit-ce-fortaleza',
    name: 'Planta Matriz & Torrefação',
    type: 'unidade',
    city: 'Fortaleza',
    state: 'CE',
    desc: 'Unidade Matriz • Centro de Comando de Segurança & Torrefação Principal',
    details: '42 operadores ativos • 12 viaturas conectadas • Perímetro 100% monitorado',
    status: 'Operação Máxima',
    u: 0.81,
    v: 0.28,
  },
  {
    id: 'alerta-ce',
    name: 'Alerta Crítico: Portaria 02 (Fortaleza)',
    type: 'alerta',
    city: 'Fortaleza',
    state: 'CE',
    desc: 'Tentativa de crachá não autorizado no portão de carga pesada',
    details: 'Líder Cristiane Fialho acionada • Ronda Alpha direcionada ao local',
    status: 'Em Investigação',
    u: 0.79,
    v: 0.24,
  },
  {
    id: 'unit-rn-natal',
    name: 'Hub de Distribuição Nordeste',
    type: 'unidade',
    city: 'Natal',
    state: 'RN',
    desc: 'Centro de Distribuição Avançado & Logística Interestadual',
    details: '18 operadores • Expedição de cargas rastreada via satélite 24/7',
    status: 'Ativo 24h',
    u: 0.86,
    v: 0.32,
  },
  {
    id: 'unit-ba-salvador',
    name: 'Centro Operacional Bahia',
    type: 'unidade',
    city: 'Salvador',
    state: 'BA',
    desc: 'Base Operacional Regional & Hub de Frotas Pesadas',
    details: '14 operadores • Pátio de carretas monitorado por CFTV analítico',
    status: 'Monitorado',
    u: 0.77,
    v: 0.52,
  },
  {
    id: 'unit-mg-varginha',
    name: 'Fábrica Histórica & Silos',
    type: 'unidade',
    city: 'Varginha',
    state: 'MG',
    desc: 'Berço 3 Corações • Armazém Geral de Grãos & Silos Industriais',
    details: '38 operadores • Monitoramento termográfico de silos 21°C • Estável',
    status: 'Segurança Total',
    u: 0.69,
    v: 0.72,
  },
  {
    id: 'cam-mg',
    name: 'Câmera C-04 Térmica (Silos Varginha)',
    type: 'camera',
    city: 'Varginha',
    state: 'MG',
    desc: 'Sensor infravermelho de longo alcance e análise termográfica por IA',
    details: 'Transmissão HD 60fps • 0 falsos positivos nas últimas 24h',
    status: 'Ao Vivo 60fps',
    u: 0.71,
    v: 0.75,
  },
  {
    id: 'unit-sp-matriz',
    name: 'Sede Corporativa & Centro Sul',
    type: 'unidade',
    city: 'São Paulo',
    state: 'SP',
    desc: 'Gestão Executiva & Centro Logístico Sudeste',
    details: '24 operadores • Controle biométrico e escolta armada integrada',
    status: 'Operacional',
    u: 0.64,
    v: 0.78,
  },
  {
    id: 'unit-pr-curitiba',
    name: 'CD Regional Sul (Curitiba)',
    type: 'unidade',
    city: 'Curitiba',
    state: 'PR',
    desc: 'Centro de Distribuição Regional e Armazenamento Climatizado',
    details: '16 operadores • Rastreamento de docas e frotas ativas',
    status: 'Online',
    u: 0.60,
    v: 0.83,
  },
  {
    id: 'unit-rs-portoalegre',
    name: 'Base Logística Extremo Sul',
    type: 'unidade',
    city: 'Porto Alegre',
    state: 'RS',
    desc: 'Hub Integrado de Distribuição e Escolta Rodoviária Sul',
    details: '12 operadores • Monitoramento de comboios interestaduais',
    status: 'Operacional',
    u: 0.56,
    v: 0.90,
  },
  {
    id: 'ronda-br116',
    name: 'Ronda Rodoviária Escolta Alpha',
    type: 'ronda',
    city: 'Corredor BR-116',
    state: 'CE/BA',
    desc: 'Comboio 04 com telemetria GPS e redundância via satélite',
    details: 'Transporte de café premium em trânsito com escolta armada',
    status: 'Em Rota Normal',
    u: 0.74,
    v: 0.40,
  },
  {
    id: 'unit-am-manaus',
    name: 'Polo Logístico Norte (Manaus)',
    type: 'unidade',
    city: 'Manaus',
    state: 'AM',
    desc: 'Armazenamento Regional & Rota Fluvial Amazônica',
    details: '10 operadores • Monitoramento perimetral e portuário',
    status: 'Ativo',
    u: 0.35,
    v: 0.32,
  },
  {
    id: 'ronda-pa-belem',
    name: 'Ronda Fluvial & CD Belém',
    type: 'ronda',
    city: 'Belém',
    state: 'PA',
    desc: 'Escolta Logística de Cargas e Pátio Norte',
    details: 'Viatura 07 conectada com câmeras embarcadas',
    status: 'Em Patrulhamento',
    u: 0.58,
    v: 0.23,
  },
];

export default function BrazilMap3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeMarker, setActiveMarker] = useState<Marker3DData | null>(null);
  const [hoveredMarker, setHoveredMarker] = useState<Marker3DData | null>(null);
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const isAutoRotatingRef = useRef(true);
  const [webglError, setWebglError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Interaction handlers
  const resetCameraRef = useRef<(() => void) | null>(null);
  const zoomInRef = useRef<(() => void) | null>(null);
  const zoomOutRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene Setup - Cinematic Deep Dark Blue Navy
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x06090e);

    // 2. Controlled Perspective Camera (Almost Frontal view)
    const aspect = container.clientWidth / (container.clientHeight || 1);
    const camera = new THREE.PerspectiveCamera(36, aspect, 0.1, 100);
    // Initial camera positioned directly in front of Brazil with slight altitude
    const initialCamZ = 8.5;
    camera.position.set(0, 0, initialCamZ);
    camera.lookAt(0, 0, 0);

    // 3. WebGL Renderer with Antialiasing
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.1;
      renderer.domElement.className = 'w-full h-full block cursor-grab active:cursor-grabbing';
      container.appendChild(renderer.domElement);
    } catch {
      setWebglError(true);
      setIsLoading(false);
      return;
    }

    const canvas = renderer.domElement;

    // 4. Lighting Rig
    const ambientLight = new THREE.AmbientLight(0x405575, 1.4);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xf5d39e, 1.8);
    keyLight.position.set(2, 4, 6);
    scene.add(keyLight);

    const rimBlueLight = new THREE.DirectionalLight(0x3882d4, 1.4);
    rimBlueLight.position.set(-4, -2, 5);
    scene.add(rimBlueLight);

    // 5. Main Map Group (Controlled Frontal Orientation)
    const mapGroup = new THREE.Group();
    // Keep it nearly frontal (very gentle tilt for 3D depth, NOT laid flat)
    mapGroup.rotation.x = -0.06;
    mapGroup.rotation.y = 0;
    scene.add(mapGroup);

    // 6. Map Dimensions (matches Brazil aspect ratio 1.33:1)
    const MAP_WIDTH = 6.4;
    const MAP_HEIGHT = 4.8;

    // Helper: Convert UV (0..1) to Local 3D Coordinates on the Map Plane
    const uvTo3D = (u: number, v: number, zElevation = 0.12): THREE.Vector3 => {
      const x = (u - 0.5) * MAP_WIDTH;
      const y = (0.5 - v) * MAP_HEIGHT;
      return new THREE.Vector3(x, y, zElevation);
    };

    // 7. Load Brazil Texture Map & Build 3D Extruded Plate
    const textureLoader = new THREE.TextureLoader();
    let mapMesh: THREE.Mesh | null = null;

    textureLoader.load(
      ASSETS.mapaBrasil,
      (texture) => {
        texture.generateMipmaps = true;
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.colorSpace = THREE.SRGBColorSpace;

        // Plane Geometry with subtle vertex curvature
        const planeGeo = new THREE.PlaneGeometry(MAP_WIDTH, MAP_HEIGHT, 48, 48);
        const planeMat = new THREE.MeshStandardMaterial({
          map: texture,
          roughness: 0.4,
          metalness: 0.2,
          emissive: new THREE.Color(0x0c1522),
          emissiveIntensity: 0.3,
          side: THREE.DoubleSide,
        });

        mapMesh = new THREE.Mesh(planeGeo, planeMat);
        mapMesh.position.set(0, 0, 0);
        mapGroup.add(mapMesh);

        // 3D Backplate Depth / Rim Box for subtle volumetric chassis
        const backGeo = new THREE.BoxGeometry(MAP_WIDTH + 0.08, MAP_HEIGHT + 0.08, 0.08);
        const backMat = new THREE.MeshStandardMaterial({
          color: 0x0c121c,
          roughness: 0.6,
          metalness: 0.5,
        });
        const backMesh = new THREE.Mesh(backGeo, backMat);
        backMesh.position.set(0, 0, -0.045);
        mapGroup.add(backMesh);

        // Glowing Outer Frame
        const edges = new THREE.EdgesGeometry(new THREE.PlaneGeometry(MAP_WIDTH + 0.02, MAP_HEIGHT + 0.02));
        const lineMat = new THREE.LineBasicMaterial({
          color: 0xd4a373,
          transparent: true,
          opacity: 0.35,
        });
        const wireframe = new THREE.LineSegments(edges, lineMat);
        wireframe.position.z = 0.01;
        mapGroup.add(wireframe);

        setIsLoading(false);
      },
      undefined,
      () => {
        setWebglError(true);
        setIsLoading(false);
      }
    );

    // 8. 3D Markers strictly attached to mapGroup children at geographic positions
    const markerObjects: {
      mesh: THREE.Group;
      data: Marker3DData;
      pulseRing: THREE.Mesh;
      halo?: THREE.Mesh;
    }[] = [];
    const raycastTargets: THREE.Object3D[] = [];

    MARKERS_DATA.forEach((data) => {
      const markerGroup = new THREE.Group();
      const pos = uvTo3D(data.u, data.v, 0.08);
      markerGroup.position.copy(pos);

      let primaryColor = 0xd4a373; // Gold 3C
      let glowColor = 0xf5c382;

      if (data.type === 'alerta') {
        primaryColor = 0xef4444; // Red
        glowColor = 0xff6b6b;
      } else if (data.type === 'ronda') {
        primaryColor = 0x10b981; // Emerald
        glowColor = 0x34d399;
      } else if (data.type === 'camera') {
        primaryColor = 0x38bdf8; // Sky blue
        glowColor = 0x7dd3fc;
      }

      // Base Stem Pin
      const pinGeo = new THREE.CylinderGeometry(0.015, 0.008, 0.16, 10);
      const pinMat = new THREE.MeshBasicMaterial({
        color: primaryColor,
        transparent: true,
        opacity: 0.85,
      });
      const pin = new THREE.Mesh(pinGeo, pinMat);
      pin.rotation.x = Math.PI / 2;
      pin.position.z = 0.08;
      markerGroup.add(pin);

      // Floating Glowing Beacon Sphere
      const sphereGeo = new THREE.SphereGeometry(0.09, 16, 16);
      const sphereMat = new THREE.MeshStandardMaterial({
        color: primaryColor,
        emissive: glowColor,
        emissiveIntensity: 0.9,
        roughness: 0.2,
        metalness: 0.8,
      });
      const sphere = new THREE.Mesh(sphereGeo, sphereMat);
      sphere.position.z = 0.18;
      sphere.userData = { markerData: data };
      raycastTargets.push(sphere);
      markerGroup.add(sphere);

      // Ground Pulsing Ring
      const ringGeo = new THREE.RingGeometry(0.08, 0.14, 20);
      const ringMat = new THREE.MeshBasicMaterial({
        color: primaryColor,
        transparent: true,
        opacity: 0.65,
        side: THREE.DoubleSide,
      });
      const pulseRing = new THREE.Mesh(ringGeo, ringMat);
      pulseRing.position.z = 0.01;
      markerGroup.add(pulseRing);

      // Expanding Shockwave Halo for Critical Alerts & Major Units
      let halo: THREE.Mesh | undefined;
      if (data.type === 'alerta' || data.type === 'unidade') {
        const haloGeo = new THREE.RingGeometry(0.12, 0.20, 24);
        const haloMat = new THREE.MeshBasicMaterial({
          color: primaryColor,
          transparent: true,
          opacity: 0.6,
          side: THREE.DoubleSide,
        });
        halo = new THREE.Mesh(haloGeo, haloMat);
        halo.position.z = 0.015;
        markerGroup.add(halo);
      }

      // Add to mapGroup so it rotates and scales perfectly with the map
      mapGroup.add(markerGroup);
      markerObjects.push({ mesh: markerGroup, data, pulseRing, halo });
    });

    // 9. 3D Logistical Arcs Connecting Strategic Units Across Brazil
    const connectionPairs = [
      ['unit-ce-fortaleza', 'unit-rn-natal'],
      ['unit-ce-fortaleza', 'unit-ba-salvador'],
      ['unit-ba-salvador', 'unit-mg-varginha'],
      ['unit-mg-varginha', 'unit-sp-matriz'],
      ['unit-sp-matriz', 'unit-pr-curitiba'],
      ['unit-pr-curitiba', 'unit-rs-portoalegre'],
      ['unit-ce-fortaleza', 'unit-am-manaus'],
    ];

    const splineLines: { curve: THREE.QuadraticBezierCurve3; lineMesh: THREE.Line; pulseParticle: THREE.Mesh }[] = [];

    connectionPairs.forEach(([idA, idB]) => {
      const markerA = MARKERS_DATA.find((m) => m.id === idA);
      const markerB = MARKERS_DATA.find((m) => m.id === idB);
      if (!markerA || !markerB) return;

      const pA = uvTo3D(markerA.u, markerA.v, 0.16);
      const pB = uvTo3D(markerB.u, markerB.v, 0.16);

      const mid = new THREE.Vector3().addVectors(pA, pB).multiplyScalar(0.5);
      const distance = pA.distanceTo(pB);
      mid.z += distance * 0.28 + 0.15; // Gentle 3D arch

      const curve = new THREE.QuadraticBezierCurve3(pA, mid, pB);
      const points = curve.getPoints(32);
      const curveGeo = new THREE.BufferGeometry().setFromPoints(points);
      const curveMat = new THREE.LineDashedMaterial({
        color: 0xd4a373,
        dashSize: 0.12,
        gapSize: 0.06,
        transparent: true,
        opacity: 0.55,
      });
      const lineMesh = new THREE.Line(curveGeo, curveMat);
      lineMesh.computeLineDistances();
      mapGroup.add(lineMesh);

      // Data highway energy particle
      const particleGeo = new THREE.SphereGeometry(0.04, 10, 10);
      const particleMat = new THREE.MeshBasicMaterial({ color: 0xfff4e0 });
      const pulseParticle = new THREE.Mesh(particleGeo, particleMat);
      mapGroup.add(pulseParticle);

      splineLines.push({ curve, lineMesh, pulseParticle });
    });

    // 10. 3D Radar Wave from Matriz Fortaleza Hub
    const radarGeo = new THREE.RingGeometry(0.08, 0.16, 36);
    const radarMat = new THREE.MeshBasicMaterial({
      color: 0xd4a373,
      transparent: true,
      opacity: 0.65,
      side: THREE.DoubleSide,
    });
    const radarMesh = new THREE.Mesh(radarGeo, radarMat);
    const radarCenter = uvTo3D(0.81, 0.28, 0.02);
    radarMesh.position.copy(radarCenter);
    mapGroup.add(radarMesh);

    // 11. Controlled Mouse & Touch Controls (Strictly Clamped)
    let isPointerDown = false;
    let prevPointerX = 0;
    let prevPointerY = 0;
    let targetRotationY = 0;
    let targetRotationX = -0.06;
    let targetCamZ = initialCamZ;
    let currentCamZ = initialCamZ;
    let mouseParallaxX = 0;
    let mouseParallaxY = 0;

    const onPointerDown = (e: PointerEvent) => {
      isPointerDown = true;
      prevPointerX = e.clientX;
      prevPointerY = e.clientY;
      isAutoRotatingRef.current = false;
      setIsAutoRotating(false);
    };

    const onPointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      const normX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const normY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      mouseParallaxX = normX * 0.08;
      mouseParallaxY = normY * 0.06;

      if (isPointerDown) {
        const deltaX = e.clientX - prevPointerX;
        const deltaY = e.clientY - prevPointerY;
        prevPointerX = e.clientX;
        prevPointerY = e.clientY;

        targetRotationY += deltaX * 0.003;
        targetRotationX += deltaY * 0.0025;

        // Strictly clamp rotation angles so the map remains frontal and never flips
        targetRotationY = Math.max(-0.18, Math.min(0.18, targetRotationY));
        targetRotationX = Math.max(-0.16, Math.min(0.08, targetRotationX));
      } else {
        // Raycasting for hover tooltip
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(new THREE.Vector2(normX, normY), camera);
        const intersects = raycaster.intersectObjects(raycastTargets);

        if (intersects.length > 0) {
          const hit = intersects[0].object.userData.markerData as Marker3DData;
          setHoveredMarker(hit);
          canvas.style.cursor = 'pointer';
        } else {
          setHoveredMarker(null);
          canvas.style.cursor = 'grab';
        }
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!isPointerDown) return;
      isPointerDown = false;

      const rect = container.getBoundingClientRect();
      const normX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const normY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(normX, normY), camera);
      const intersects = raycaster.intersectObjects(raycastTargets);

      if (intersects.length > 0) {
        const hit = intersects[0].object.userData.markerData as Marker3DData;
        setActiveMarker(hit);
      }
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      targetCamZ += e.deltaY * 0.003;
      // Clamp zoom so the entire Brazil territory stays comfortably in view
      targetCamZ = Math.max(6.5, Math.min(10.5, targetCamZ));
    };

    canvas.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('wheel', onWheel, { passive: false });

    // UI Overlay control bindings
    resetCameraRef.current = () => {
      targetRotationY = 0;
      targetRotationX = -0.06;
      targetCamZ = initialCamZ;
      isAutoRotatingRef.current = true;
      setIsAutoRotating(true);
    };

    zoomInRef.current = () => {
      targetCamZ = Math.max(6.5, targetCamZ - 0.8);
    };

    zoomOutRef.current = () => {
      targetCamZ = Math.min(10.5, targetCamZ + 0.8);
    };

    // 12. Responsive Resize
    const resizeObserver = new ResizeObserver(() => {
      if (!container || !renderer) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w === 0 || h === 0) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
    resizeObserver.observe(container);

    // 13. Animation Loop (Smooth and Controlled)
    let animationFrameId: number;
    let clock = new THREE.Clock();
    let radarScale = 1;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Gentle auto-float when not interacting
      if (isAutoRotatingRef.current && !isPointerDown) {
        targetRotationY = Math.sin(elapsed * 0.18) * 0.06;
        targetRotationX = -0.06 + Math.cos(elapsed * 0.14) * 0.03;
      }

      // Smooth interpolation (Lerp)
      mapGroup.rotation.y += (targetRotationY + mouseParallaxX - mapGroup.rotation.y) * 0.05;
      mapGroup.rotation.x += (targetRotationX + mouseParallaxY - mapGroup.rotation.x) * 0.05;

      currentCamZ += (targetCamZ - currentCamZ) * 0.08;
      camera.position.z = currentCamZ;
      camera.lookAt(0, 0, 0);

      // Marker pulse animation
      markerObjects.forEach((m, idx) => {
        const isAlert = m.data.type === 'alerta';
        const speed = isAlert ? 3.0 : 1.8;
        const pulse = Math.sin(elapsed * speed + idx) * 0.5 + 0.5;

        m.pulseRing.scale.setScalar(1.0 + pulse * 0.35);
        (m.pulseRing.material as THREE.Material).opacity = 0.7 - pulse * 0.35;

        if (m.halo) {
          const haloScale = ((elapsed * 0.7 + idx * 0.35) % 1.5) * 1.5 + 0.6;
          const haloOpacity = Math.max(0, 0.65 - haloScale * 0.32);
          m.halo.scale.setScalar(haloScale);
          (m.halo.material as THREE.Material).opacity = haloOpacity;
        }
      });

      // Flow particles along 3D connection highways
      splineLines.forEach((item, idx) => {
        const t = ((elapsed * 0.28 + idx * 0.2) % 1.0);
        const pt = item.curve.getPoint(t);
        item.pulseParticle.position.copy(pt);
      });

      // Expanding 3D Radar Wave
      radarScale += delta * 0.65;
      if (radarScale > 4.2) radarScale = 0.3;
      radarMesh.scale.setScalar(radarScale);
      (radarMat as THREE.Material).opacity = Math.max(0, 0.7 - radarScale * 0.16);

      renderer.render(scene, camera);
    };

    animate();

    // 14. Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      canvas.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('wheel', onWheel);

      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry?.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose());
          } else {
            obj.material?.dispose();
          }
        }
      });
      if (renderer.domElement.parentElement) {
        renderer.domElement.parentElement.removeChild(renderer.domElement);
      }
      renderer.forceContextLoss();
      renderer.dispose();
    };
  }, []);

  // Fallback if WebGL is unavailable
  if (webglError) {
    return (
      <div className="relative w-full h-[320px] sm:h-[360px] md:h-[390px] rounded-2xl overflow-hidden bg-[#080d13] border border-[#1F2735] flex items-center justify-center">
        <img
          src={ASSETS.mapaBrasil}
          alt="Mapa do Brasil em tempo real"
          className="w-full h-full object-contain object-center block"
        />
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-[#05080c]/5 to-[#05080c]/15" />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[320px] sm:h-[360px] md:h-[390px] rounded-2xl overflow-hidden bg-[#070b10] border border-[#1F2735] shadow-2xl select-none group"
    >
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-[#070b10] flex flex-col items-center justify-center gap-3 z-30">
          <div className="w-8 h-8 rounded-full border-2 border-[#D4A373] border-t-transparent animate-spin"></div>
          <span className="text-xs font-mono text-[#D4A373] uppercase tracking-widest">
            Inicializando Radar 3D...
          </span>
        </div>
      )}

      {/* Subtle Vignette Gradient Overlay */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-[#05080c]/50 via-transparent to-[#05080c]/20" />

      {/* Top Left: 3D Tactical Status Pill */}
      <div className="absolute top-3 left-3 bg-[#0B1018]/90 border border-[#233145] rounded-xl px-2.5 py-1.5 flex items-center gap-2 pointer-events-none backdrop-blur-md shadow-lg z-10">
        <Crosshair className="w-3.5 h-3.5 text-[#D4A373] animate-spin-slow" />
        <span className="text-[10px] font-mono font-bold text-slate-300">
          MONITORAMENTO 3D • TERRITÓRIO NACIONAL
        </span>
      </div>

      {/* Top Right: Interactive Map Controls */}
      <div className="absolute top-3 right-3 flex items-center gap-1.5 z-20">
        <button
          onClick={() => zoomInRef.current?.()}
          title="Aproximar Zoom"
          className="w-7 h-7 rounded-lg bg-[#0E1520]/90 border border-[#233145] hover:border-[#D4A373] text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => zoomOutRef.current?.()}
          title="Afastar Zoom"
          className="w-7 h-7 rounded-lg bg-[#0E1520]/90 border border-[#233145] hover:border-[#D4A373] text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => {
            const nextState = !isAutoRotating;
            setIsAutoRotating(nextState);
            isAutoRotatingRef.current = nextState;
            if (nextState) resetCameraRef.current?.();
          }}
          title={isAutoRotating ? 'Pausar Auto-Movimento' : 'Ativar Auto-Movimento'}
          className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-colors cursor-pointer ${
            isAutoRotating
              ? 'bg-[#D4A373]/20 border-[#D4A373] text-[#D4A373]'
              : 'bg-[#0E1520]/90 border-[#233145] text-slate-400 hover:text-white'
          }`}
        >
          <RotateCw className={`w-3.5 h-3.5 ${isAutoRotating ? 'animate-spin-slow' : ''}`} />
        </button>
      </div>

      {/* Bottom Floating Hover Tip */}
      {hoveredMarker && !activeMarker && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-[#0A0E15]/95 border border-[#D4A373]/60 rounded-xl px-3.5 py-1.5 pointer-events-none backdrop-blur-md shadow-xl flex items-center gap-2 animate-in fade-in zoom-in-95 duration-150 z-20">
          <span
            className={`w-2 h-2 rounded-full ${
              hoveredMarker.type === 'alerta'
                ? 'bg-red-500 animate-ping'
                : hoveredMarker.type === 'ronda'
                ? 'bg-emerald-400'
                : hoveredMarker.type === 'camera'
                ? 'bg-blue-400'
                : 'bg-[#D4A373]'
            }`}
          />
          <span className="text-xs font-bold text-white">{hoveredMarker.name}</span>
          <span className="text-[10px] text-[#D4A373] font-semibold">({hoveredMarker.city} - {hoveredMarker.state})</span>
          <span className="text-[9px] text-slate-400 font-mono">• Clique para detalhes</span>
        </div>
      )}

      {/* Selected Marker Detail Modal Box */}
      {activeMarker && (
        <div className="absolute bottom-3 left-3 right-3 bg-[#0A0E15]/95 border border-[#D4A373]/60 rounded-2xl p-4 backdrop-blur-md z-30 shadow-2xl flex items-start justify-between gap-3 animate-in fade-in slide-in-from-bottom-2">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  activeMarker.type === 'alerta'
                    ? 'bg-red-500'
                    : activeMarker.type === 'ronda'
                    ? 'bg-emerald-400'
                    : activeMarker.type === 'camera'
                    ? 'bg-blue-400'
                    : 'bg-[#D4A373]'
                }`}
              />
              <h4 className="text-xs font-bold text-white leading-tight">{activeMarker.name}</h4>
              <span className="text-[9px] bg-[#261C14] border border-[#523A25] text-[#D4A373] px-2 py-0.5 rounded-md font-extrabold uppercase">
                {activeMarker.city} - {activeMarker.state}
              </span>
              <span className="text-[9px] text-emerald-400 font-semibold bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
                {activeMarker.status}
              </span>
            </div>
            <p className="text-[11px] text-slate-200 mt-1 leading-relaxed">{activeMarker.desc}</p>
            <p className="text-[10px] text-[#D4A373] mt-1 font-medium">{activeMarker.details}</p>
          </div>
          <button
            onClick={() => setActiveMarker(null)}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-[#1E2636] transition-colors shrink-0 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Bottom Mini Legend */}
      <div className="absolute bottom-3 left-3 hidden sm:flex items-center gap-3 bg-[#080D14]/85 border border-[#1F2B3D] px-3 py-1 rounded-xl backdrop-blur-sm text-[9px] text-slate-400 pointer-events-none z-10">
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-[#D4A373]" />
          <span>Unidades 3C</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>Rondas</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-blue-400" />
          <span>Câmeras CFTV</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-red-500" />
          <span>Alerta</span>
        </div>
      </div>
    </div>
  );
}
