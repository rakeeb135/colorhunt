import React, { useState, useRef, useEffect } from 'react'

function App() {
  const [hasStarted, setHasStarted] = useState(false)
  const [targetColor, setTargetColor] = useState('#34D399')
  const [cameraError, setCameraError] = useState(null)

  
  const videoRef = useRef(null)
  
  const streamRef = useRef(null)

  useEffect(() => {
    if (hasStarted) {
      startCamera()
    } else {
      stopCamera()
    }

    return () => stopCamera()
  }, [hasStarted])

  // Function 1: Request access and connect the hardware stream to our video element
  async function startCamera() {
    setCameraError(null)
    
    // Configuration details 
    const constraints = {
      video: { 
        facingMode: 'environment', 
        width: { ideal: 1280 },
        height: { ideal: 720 }
      },
      audio: false
    }

    try {
      // Direct request call to the device hardware APIs
      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      
      // Store the stream 
      streamRef.current = stream

      // Injecting the raw camera stream data directly to physical HTML video tag pointer
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (error) {
      console.error("Camera access error:", error)
      setCameraError("Could not access camera. Please check permissions.")
    }
  }

  // Function 2: Safely shut down the camera stream lines to save battery and system memory
  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white p-4">
      
      {/* LANDING SCREEN */}
      {!hasStarted ? (
        <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl max-w-md w-full text-center border border-slate-700">
          <h1 className="text-3xl font-extrabold tracking-tight mb-2 text-emerald-400">
            ColorHunt 🎯
          </h1>
          <p className="text-slate-400 mb-6">
            Real-world environment color scanning game. Find objects matching the goals!
          </p>
          <button 
            onClick={() => setHasStarted(true)}
            className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-3 px-6 rounded-xl transition-all duration-200 cursor-pointer shadow-lg shadow-emerald-500/20"
          >
            Start Hunting
          </button>
        </div>
      ) : (
        /* GAMEPLAY SCREEN */
        <div className="bg-slate-800 p-6 rounded-2xl shadow-2xl max-w-md w-full border border-slate-700 flex flex-col gap-4">
          
          <div className="flex items-center justify-between bg-slate-900 p-4 rounded-xl border border-slate-700">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Target Color</p>
              <h2 className="text-lg font-bold">Find this shade!</h2>
            </div>
            <div 
              className="w-12 h-12 rounded-xl border-2 border-white shadow-inner" 
              style={{ backgroundColor: targetColor }}
            />
          </div>

          {/* Camera View Window Container */}
          <div className="relative aspect-video bg-black rounded-xl overflow-hidden border border-slate-700 flex items-center justify-center">
            {cameraError ? (
              <p className="text-sm text-red-400 p-4 text-center">{cameraError}</p>
            ) : (
              /* The physical HTML5 Video Element player */
              <video 
                ref={videoRef} // This links our JavaScript pointer directly to this tag
                autoPlay 
                playsInline 
                className="w-full h-full object-cover"
              />
            )}
            
            {/* Target Reticle Overlay: A central targeting box for scanning items */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-12 h-12 border-2 border-dashed border-white rounded-lg shadow-lg opacity-60 bg-white/10" />
            </div>
          </div>

          {/* Action buttons control bar */}
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => setHasStarted(false)}
              className="bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2.5 px-4 rounded-xl transition-all cursor-pointer"
            >
              Quit Run
            </button>
            <button className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-2.5 px-4 rounded-xl transition-all cursor-pointer shadow-md">
              Capture Scan
            </button>
          </div>

        </div>
      )}

    </div>
  )
}

export default App