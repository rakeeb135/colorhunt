import React, { useState, useRef, useEffect } from 'react'

function App() {
  const [hasStarted, setHasStarted] = useState(false)
  const [targetColor, setTargetColor] = useState('#34D399')
  const [scannedColor, setScannedColor] = useState(null) // Stores the color the user actually scans
  const [cameraError, setCameraError] = useState(null)

  const videoRef = useRef(null)
  const streamRef = useRef(null)

  useEffect(() => {
    if (hasStarted) {
      startCamera()
    } else {
      stopCamera()
      setScannedColor(null) // Reset scanner when quitting
    }
    return () => stopCamera()
  }, [hasStarted])

  async function startCamera() {
    setCameraError(null)
    const constraints = {
      video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      audio: false
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (error) {
      console.error("Camera access error:", error)
      setCameraError("Could not access camera. Please check permissions.")
    }
  }

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
  }

  // CORE ENGINE FUNCTION: Snaps a frame and extracts pixel values
  function captureAndAnalyzeColor() {
    if (!videoRef.current) return

    const video = videoRef.current;
    
    // 1. Dynamically create a hidden canvas sketchpad in system memory
    const canvas = document.createElement('canvas')
    
    // Set the canvas dimensions to perfectly match the internal dimensions of the video stream
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // 2. Draw the current exact freeze-frame of the live video directly onto our canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    // 3. Find the exact mathematical center coordinates of the canvas box
    const centerX = Math.floor(canvas.width / 2)
    const centerY = Math.floor(canvas.height / 2)

    // 4. Extract the pixel matrix block data from that central point (1 pixel wide, 1 pixel high)
    const pixelData = ctx.getImageData(centerX, centerY, 1, 1).data

    const r = pixelData[0] // Red Value
    const g = pixelData[1] // Green Value
    const b = pixelData[2] // Blue Value

    // 5. Convert the raw RGB numbers into a standard web Hex code string
    const hexColor = rgbToHex(r, g, b)
    
    // Save the color to our app memory to trigger the UI update!
    setScannedColor(hexColor)
  }

  // Helper utility function: Converts raw integer components into clean hex strings
  function rgbToHex(r, g, b) {
    return "#" + [r, g, b].map(x => {
      const hex = x.toString(16) // Convert number to base-16
      return hex.length === 1 ? "0" + hex : hex // Ensure 2-digit padding
    }).join("").toUpperCase()
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
          
          {/* Colors Panel Section */}
          <div className="grid grid-cols-2 gap-3 bg-slate-900 p-4 rounded-xl border border-slate-700">
            <div className="flex flex-col items-center justify-center border-r border-slate-700 pr-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Target Color</p>
              <div className="w-14 h-14 rounded-xl border-2 border-white shadow-md mb-1" style={{ backgroundColor: targetColor }} />
              <span className="text-xs font-mono font-bold text-slate-300">{targetColor}</span>
            </div>
            
            <div className="flex flex-col items-center justify-center pl-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Your Scan</p>
              <div 
                className="w-14 h-14 rounded-xl border-2 border-slate-600 shadow-md mb-1 flex items-center justify-center text-xs font-semibold text-slate-500 bg-slate-800 transition-all duration-200"
                style={{ backgroundColor: scannedColor || 'transparent' }}
              >
                {!scannedColor && '?'}
              </div>
              <span className="text-xs font-mono font-bold text-slate-300">{scannedColor || '----'}</span>
            </div>
          </div>

          {/* Camera Feed Window container */}
          <div className="relative aspect-video bg-black rounded-xl overflow-hidden border border-slate-700 flex items-center justify-center">
            {cameraError ? (
              <p className="text-sm text-red-400 p-4 text-center">{cameraError}</p>
            ) : (
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
            )}
            
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-12 h-12 border-2 border-dashed border-white rounded-lg shadow-lg opacity-60 bg-white/10" />
            </div>
          </div>

          {/* Controls Bar */}
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => setHasStarted(false)}
              className="bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2.5 px-4 rounded-xl transition-all cursor-pointer"
            >
              Quit Run
            </button>
            <button 
              onClick={captureAndAnalyzeColor}
              className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-2.5 px-4 rounded-xl transition-all cursor-pointer shadow-md"
            >
              Capture Scan
            </button>
          </div>

        </div>
      )}

    </div>
  )
}

export default App