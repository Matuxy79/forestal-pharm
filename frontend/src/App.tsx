import { useState, useEffect, useRef, useCallback } from 'react';

const CHAT_URL = import.meta.env.VITE_CHAT_URL ?? 'http://localhost:8000';
const CHAT_HOST = CHAT_URL.replace(/^https?:\/\//, '');

type ContextKey = 'telemetry' | 'manifold';
type Axis = 'w' | 'x' | 'y' | 'z';

interface AxisConfig {
  label: string;
  color: string;
  bg: string;
  desc: string;
}

interface ContextConfig {
  title: string;
  subtitle: string;
  w: AxisConfig;
  x: AxisConfig;
  y: AxisConfig;
  z: AxisConfig;
  theme: string;
}

export default function App() {
  // --- STATE ---
  const [values, setValues] = useState({ w: 1.0, x: 0.5, y: 0.5, z: 0.5 });
  const [context, setContext] = useState<ContextKey>('telemetry');
  const [chatOpen, setChatOpen] = useState(false);
  const toggleChat = useCallback(() => setChatOpen(o => !o), []);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // --- CONFIGURATION ---
  const configs: Record<ContextKey, ContextConfig> = {
    telemetry: {
      title: "QUATERNION DESKTOP COMPOSITOR",
      subtitle: "SYSTEM TELEMETRY & 4D WORKSPACE",
      w: { label: "CPU / COMPUTE", color: "text-cyan-400", bg: "bg-cyan-500", desc: "Density / Scale" },
      x: { label: "RAM / ALLOCATION", color: "text-fuchsia-400", bg: "bg-fuchsia-500", desc: "X-Axis Distortion" },
      y: { label: "NETWORK / IO", color: "text-yellow-400", bg: "bg-yellow-500", desc: "Y-Axis Tilt" },
      z: { label: "DISK / STORAGE", color: "text-blue-400", bg: "bg-blue-500", desc: "Z-Axis Depth" },
      theme: "cyan"
    },
    manifold: {
      title: "PAWN-LOCAL INTERACTION SPACE",
      subtitle: "UNIFIED ENERGY SUBSTRATE",
      w: { label: "NEN / STRUCTURE", color: "text-purple-400", bg: "bg-purple-500", desc: "Total Field Density" },
      x: { label: "CURSED / BURST", color: "text-red-500", bg: "bg-red-600", desc: "Combat Spike (X)" },
      y: { label: "CHAKRA / FLOW", color: "text-blue-400", bg: "bg-blue-500", desc: "Sustain Ring (Y)" },
      z: { label: "SUMMONS / EXT", color: "text-green-400", bg: "bg-green-500", desc: "External Nodes (Z)" },
      theme: "purple"
    }
  };

  const activeConf = configs[context];

  // Handle Slider Input
  const handleInput = (axis: Axis, val: string) => {
    setValues(prev => ({ ...prev, [axis]: parseFloat(val) }));
  };

  // --- 3D CANVAS RENDERING ENGINE ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animationFrameId: number;
    let time = 0;

    // Geometry Generation: 3D Rings & Torus Knot
    const points: { x: number; y: number; z: number; type: string }[] = [];
    const numPoints = 150;
    
    for (let i = 0; i < numPoints; i++) {
      const t = (i / numPoints) * Math.PI * 2;
      points.push({ x: Math.cos(t) * 100, y: Math.sin(t) * 100, z: Math.sin(t*3) * 20, type: 'core' });
      points.push({ x: Math.sin(t*2) * 30, y: Math.cos(t) * 120, z: Math.sin(t) * 120, type: 'flow' });
      const r = 40 * (1.5 + Math.sin(3 * t));
      points.push({
        x: r * Math.cos(2 * t),
        y: r * Math.sin(2 * t),
        z: 40 * Math.cos(3 * t),
        type: 'burst'
      });
    }

    // Normalize Quaternion
    const getNormalizedQuaternion = () => {
      const { w, x, y, z } = values;
      const qw = w; 
      const qx = (x - 0.5) * 2;
      const qy = (y - 0.5) * 2;
      const qz = (z - 0.5) * 2;
      
      const mag = Math.sqrt(qw*qw + qx*qx + qy*qy + qz*qz) || 1;
      return [qw/mag, qx/mag, qy/mag, qz/mag];
    };

    // Rotate 3D point using quaternion matrix
    const rotate3D = (p: { x: number; y: number; z: number }, qNorm: number[], autoTime: number) => {
      const [qw, qx, qy, qz] = qNorm;
      
      const st = Math.sin(autoTime * 0.01);
      const ct = Math.cos(autoTime * 0.01);
      const px = p.x * ct - p.z * st;
      const py = p.y;
      const pz = p.x * st + p.z * ct;

      const r11 = 1 - 2*qy*qy - 2*qz*qz;
      const r12 = 2*qx*qy - 2*qz*qw;
      const r13 = 2*qx*qz + 2*qy*qw;
      
      const r21 = 2*qx*qy + 2*qz*qw;
      const r22 = 1 - 2*qx*qx - 2*qz*qz;
      const r23 = 2*qy*qz - 2*qx*qw;
      
      const r31 = 2*qx*qz - 2*qy*qw;
      const r32 = 2*qy*qz + 2*qx*qw;
      const r33 = 1 - 2*qx*qx - 2*qy*qy;

      return {
        x: px*r11 + py*r12 + pz*r13,
        y: px*r21 + py*r22 + pz*r23,
        z: px*r31 + py*r32 + pz*r33
      };
    };

    const render = () => {
      ctx.fillStyle = 'rgba(10, 10, 15, 0.2)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const qNorm = getNormalizedQuaternion();
      const densityScale = Math.max(0.2, values.w * 1.5); 
      
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      points.forEach((p, index) => {
        const rotated = rotate3D(p, qNorm, time);
        
        const perspective = 300;
        const zIndex = rotated.z + 200;
        const scaleProjected = perspective / zIndex;
        
        const finalScale = scaleProjected * densityScale;
        const xProj = (rotated.x * finalScale) + cx;
        const yProj = (rotated.y * finalScale) + cy;

        ctx.beginPath();
        ctx.arc(xProj, yProj, Math.max(0.5, 2 * finalScale), 0, Math.PI * 2);
        
        if (context === 'telemetry') {
          ctx.fillStyle = p.type === 'burst' ? '#f0abfc' : (p.type === 'flow' ? '#67e8f9' : '#fef08a');
        } else {
          ctx.fillStyle = p.type === 'burst' ? '#ef4444' : (p.type === 'flow' ? '#60a5fa' : '#a855f7');
        }
        
        ctx.fill();

        if (index > 0 && index % 15 !== 0) {
          const prevRotated = rotate3D(points[index - 1], qNorm, time);
          const prevScale = perspective / (prevRotated.z + 200) * densityScale;
          const prevX = (prevRotated.x * prevScale) + cx;
          const prevY = (prevRotated.y * prevScale) + cy;
          
          ctx.beginPath();
          ctx.moveTo(prevX, prevY);
          ctx.lineTo(xProj, yProj);
          ctx.strokeStyle = context === 'telemetry' ? 'rgba(34, 211, 238, 0.15)' : 'rgba(168, 85, 247, 0.15)';
          ctx.stroke();
        }
      });

      time += values.w * 2;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [values, context]);

  // Math helper for display
  const getNormalized = () => {
    const { w, x, y, z } = values;
    const mag = Math.sqrt(w*w + x*x + y*y + z*z) || 1;
    return {
      qw: (w/mag).toFixed(3),
      qx: (x/mag).toFixed(3),
      qy: (y/mag).toFixed(3),
      qz: (z/mag).toFixed(3)
    };
  };
  const norm = getNormalized();

  // Slider thumb color styles (inline since dynamic Tailwind classes in pseudo-selectors are tricky)
  const sliderStyle = (_bgColor: string): React.CSSProperties => ({
    WebkitAppearance: 'none',
    appearance: 'none',
    background: '#1f2937',
    height: '4px',
    borderRadius: '9999px',
    outline: 'none',
  });

  return (
    <div className="min-h-screen bg-[#050508] text-gray-300 font-mono p-4 md:p-8 flex flex-col tracking-tight overflow-hidden relative selection:bg-cyan-900">
      
      {/* Background Grid & Scanlines */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20"
           style={{ backgroundImage: 'linear-gradient(rgba(34, 211, 238, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(34, 211, 238, 0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
      </div>
      <div className="absolute inset-0 z-0 pointer-events-none opacity-10 bg-gradient-to-b from-transparent via-[#0a0a0f] to-transparent bg-[length:100%_4px]"></div>

      {/* HEADER */}
      <header className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-gray-800 pb-4">
        <div>
          <h1 className={`text-2xl md:text-3xl font-bold tracking-widest uppercase ${context === 'telemetry' ? 'text-cyan-400' : 'text-purple-400'} drop-shadow-[0_0_8px_currentColor]`}>
            {activeConf.title}
          </h1>
          <p className="text-gray-500 text-xs tracking-[0.2em] mt-1">{activeConf.subtitle} // ACTIVE</p>
        </div>
        
        {/* Substrate Toggle */}
        <div className="mt-4 md:mt-0 flex items-center bg-gray-900 rounded-full p-1 border border-gray-800">
          <button 
            onClick={() => setContext('telemetry')}
            className={`px-4 py-1 text-xs rounded-full transition-all ${context === 'telemetry' ? 'bg-cyan-900/50 text-cyan-300 border border-cyan-700/50' : 'text-gray-500 hover:text-gray-300'}`}>
            LINUX COMPOSITOR
          </button>
          <button 
            onClick={() => setContext('manifold')}
            className={`px-4 py-1 text-xs rounded-full transition-all ${context === 'manifold' ? 'bg-purple-900/50 text-purple-300 border border-purple-700/50' : 'text-gray-500 hover:text-gray-300'}`}>
            PAWN MANIFOLD
          </button>
        </div>
      </header>

      {/* MAIN GRID */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 flex-grow">
        
        {/* LEFT PANEL: SLIDERS */}
        <div className="lg:col-span-3 flex flex-col gap-6 bg-gray-900/40 backdrop-blur-md border border-gray-800/60 rounded-xl p-6 shadow-2xl">
          <div className="text-xs text-gray-500 tracking-[0.15em] border-b border-gray-800 pb-2 mb-2">INPUT VECTORS</div>
          
          {(['w', 'x', 'y', 'z'] as Axis[]).map((axis) => (
            <div key={axis} className="flex flex-col gap-2">
              <div className="flex justify-between items-baseline">
                <span className={`text-sm font-semibold tracking-wider ${activeConf[axis].color}`}>
                  [{axis.toUpperCase()}] {activeConf[axis].label}
                </span>
                <span className="text-xs text-gray-400">{values[axis].toFixed(2)}</span>
              </div>
              
              <input 
                type="range" 
                min={axis === 'w' ? "0.1" : "0"} 
                max={axis === 'w' ? "2.0" : "1.0"} 
                step="0.01" 
                value={values[axis]} 
                onChange={(e) => handleInput(axis, e.target.value)}
                style={{
                  ...sliderStyle(activeConf[axis].bg),
                }}
                className="w-full slider-thumb"
              />
              <span className="text-[10px] text-gray-600 uppercase tracking-widest">{activeConf[axis].desc}</span>

              {/* Dynamic thumb color injection */}
              <style>{`
                .slider-thumb::-webkit-slider-thumb {
                  -webkit-appearance: none;
                  appearance: none;
                  width: 12px;
                  height: 20px;
                  border-radius: 2px;
                  cursor: pointer;
                }
              `}</style>
            </div>
          ))}

          <div className="mt-auto pt-6 border-t border-gray-800/50">
             <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-2 flex items-center justify-between">
                <span>System Status</span>
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
             </div>
             <div className="text-xs text-gray-400 space-y-1">
                <p>Uptime: <span className="text-gray-200">14:22:09:88</span></p>
                <p>Cores: <span className="text-gray-200">12 / 16 active</span></p>
                <p>Mem: <span className="text-gray-200">{(values.x * 64).toFixed(1)} GB</span></p>
             </div>
          </div>
        </div>

        {/* CENTER PANEL: 3D RENDERER */}
        <div className="lg:col-span-6 relative flex flex-col bg-black/60 rounded-xl border border-gray-800/80 shadow-inner overflow-hidden min-h-[400px]">
          <div className="absolute top-4 left-4 z-20 flex gap-2">
            <span className={`px-2 py-1 text-[10px] border rounded ${context === 'telemetry' ? 'border-cyan-800 text-cyan-500 bg-cyan-900/20' : 'border-purple-800 text-purple-500 bg-purple-900/20'}`}>
              LIVE RENDER
            </span>
            <span className="px-2 py-1 text-[10px] border border-gray-700 text-gray-500 bg-gray-800/20">
              60 FPS
            </span>
          </div>
          
          <canvas 
            ref={canvasRef} 
            width={800} 
            height={600} 
            className="w-full h-full object-contain mix-blend-screen"
          />

          <div className="absolute bottom-4 left-4 right-4 flex justify-between text-[10px] text-gray-600">
             <span>ENGINE: Q-SPACE MANIFOLD v2.4</span>
             <span>TOPOLOGY: TORUS_KNOT / VECTOR_FIELD</span>
          </div>
        </div>

        {/* RIGHT PANEL: DATA READOUT */}
        <div className="lg:col-span-3 flex flex-col gap-4 bg-gray-900/40 backdrop-blur-md border border-gray-800/60 rounded-xl p-6 shadow-2xl">
          <div className="text-xs text-gray-500 tracking-[0.15em] border-b border-gray-800 pb-2">NORMALIZED QUATERNION</div>
          
          {/* Matrix Display */}
          <div className="bg-black/50 p-4 rounded-lg font-mono text-sm border border-gray-800/50 flex flex-col gap-2">
            <div className="flex justify-between items-center text-gray-400">
              <span>q̂_w</span> <span className="text-white">{norm.qw}</span>
            </div>
            <div className="flex justify-between items-center text-gray-400">
              <span>q̂_x</span> <span className="text-white">{norm.qx}</span>
            </div>
            <div className="flex justify-between items-center text-gray-400">
              <span>q̂_y</span> <span className="text-white">{norm.qy}</span>
            </div>
            <div className="flex justify-between items-center text-gray-400">
              <span>q̂_z</span> <span className="text-white">{norm.qz}</span>
            </div>
          </div>

          <div className="text-xs text-gray-500 tracking-[0.15em] border-b border-gray-800 pb-2 mt-4">MATHEMATICAL STATE</div>
          
          <div className="space-y-4">
            <div>
              <p className="text-[10px] text-gray-500 uppercase mb-1">Density Level (w)</p>
              <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                <div className={`h-full ${context === 'telemetry' ? 'bg-cyan-500' : 'bg-purple-500'} transition-all`} style={{ width: `${(values.w / 2) * 100}%` }}></div>
              </div>
            </div>
            
            <div>
              <p className="text-[10px] text-gray-500 uppercase mb-1">Manifold Distortion (Vector Magnitude)</p>
              <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                <div className={`h-full ${context === 'telemetry' ? 'bg-fuchsia-500' : 'bg-red-500'} transition-all`} style={{ width: `${Math.min(100, (Math.sqrt(values.x*values.x + values.y*values.y + values.z*values.z)) * 100)}%` }}></div>
              </div>
            </div>

            <div className="p-3 bg-gray-800/30 rounded border border-gray-700/50 mt-4">
              <p className="text-[10px] text-gray-400 leading-relaxed">
                {context === 'telemetry' 
                  ? "SYSTEM NOTE: High compute loads (w > 1.5) increase gravitational density of the workspace. Spikes in vector metrics (x,y,z) will re-orient the desktop manifold toward the active process." 
                  : "COMBAT NOTE: Emotional output spikes convert Actionable Energy (Ae) into Cursed bursts, destabilizing the physical topology of the RimWorld cell grid."}
              </p>
            </div>
          </div>
          
        </div>
      </div>

      {/* ── CHAINLIT CHAT DRAWER ── */}

      {/* Floating toggle button */}
      <button
        id="chat-toggle-btn"
        onClick={toggleChat}
        title={chatOpen ? 'Close Chat' : 'Open Pharmacy Chat'}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 border ${
          chatOpen
            ? 'bg-gray-900 border-gray-600 text-gray-400 hover:text-white rotate-180'
            : context === 'telemetry'
            ? 'bg-cyan-900/80 border-cyan-700 text-cyan-300 hover:bg-cyan-800 hover:scale-110'
            : 'bg-purple-900/80 border-purple-700 text-purple-300 hover:bg-purple-800 hover:scale-110'
        }`}
        style={{ backdropFilter: 'blur(12px)' }}
      >
        {chatOpen ? (
          // X icon
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          // Chat bubble icon
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )}
      </button>

      {/* Slide-in drawer */}
      <div
        id="chainlit-drawer"
        className={`fixed top-0 right-0 h-full z-40 flex flex-col transition-all duration-300 ease-in-out ${
          chatOpen ? 'w-[420px] opacity-100 translate-x-0' : 'w-[420px] opacity-0 translate-x-full pointer-events-none'
        }`}
        style={{ backdropFilter: 'blur(16px)' }}
      >
        {/* Drawer header */}
        <div className={`flex items-center justify-between px-4 py-3 border-b ${
          context === 'telemetry'
            ? 'bg-cyan-950/90 border-cyan-800/60 text-cyan-300'
            : 'bg-purple-950/90 border-purple-800/60 text-purple-300'
        }`}>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
            <span className="text-xs font-mono tracking-widest uppercase">Pharmacy Assistant</span>
          </div>
          <span className="text-[10px] font-mono text-gray-500">{CHAT_HOST}</span>
        </div>

        {/* Chainlit iframe */}
        <iframe
          id="chainlit-frame"
          src={CHAT_URL}
          title="Forestal Pharmacy Chat"
          className="flex-1 w-full border-0 bg-[#0d0d11]"
          allow="camera; microphone; clipboard-read; clipboard-write"
        />
      </div>

      {/* Dim overlay when chat open */}
      {chatOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40"
          onClick={toggleChat}
        />
      )}
    </div>
  );
}
