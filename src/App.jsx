import React, { useState, useRef, useEffect } from 'react'

function App() {
  const [hasStarted, setHasStarted] = useState(false)
  const [targetColor, setTargetColor] = useState('#34D399') // Emerald Green
  const [scannedColor, setScannedColor] = useState(null)
  const [cameraError, setCameraError] = useState(null)
  
  // Game state controls
  const [isMatch, setIsMatch] = useState(false)
  const [hasCalculated, setHasCalculated] = useState(false)

  const videoRef = useRef(null)
  const streamRef = useRef(null)

  useEffect(() => {
    if (hasStarted) {
      startCamera()
    } else {
      stopCamera()
      resetGameState()
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

  function resetGameState() {
    setScannedColor(null)
    setIsMatch(false)
    setHasCalculated(false)
  }

  // Generates a random color for the next round challenge
  function generateNextChallenge() {
    const randomHex = "#" + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0').toUpperCase()
    setTargetColor(randomHex)
    resetGameState()
  }

  function captureAndAnalyzeColor() {
    if (!videoRef.current) return

    const video = videoRef.current
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    const centerX = Math.floor(canvas.width / 2)
    const centerY = Math.floor(canvas.height / 2)
    const pixelData = ctx.getImageData(centerX, centerY, 1, 1).data

    const r = pixelData[0]
    const g = pixelData[1]
    const b = pixelData[2]

    const hexColor = rgbToHex(r, g, b)
    setScannedColor(hexColor)

    // CORE MATCH VALIDATION SEQUENCE
    // 1. Break target hex down to RGB components
    const targetRGB = hexToRgb(targetColor)
    
    // 2. Compute Euclidean distance variance between target and scanned arrays
    const distance = Math.sqrt(
      Math.pow(targetRGB.r - r, 2) +
      Math.pow(targetRGB.g - g, 2) +
      Math.pow(targetRGB.b - b, 2)
    )

    // 3. Define sensitivity threshold (Under 45 represents roughly a 15% color shade tolerance gap)
    const MATCH_THRESHOLD = 45
    
    if (distance <= MATCH_THRESHOLD) {
      setIsMatch(true)
    } else {
      setIsMatch(false)
    }
    setHasCalculated(true)
  }

  // Helper Utility: Decodes Hex strings back to integer channels
  function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 }
  }

  function rgbToHex(r, g, b) {
    return "#" + [r, g, b].map(x => {
      const hex = x.toString(16)
      return hex.length === 1 ? "0" + hex : hex
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
          
          {/* Colors Panel */}
          <div className="grid grid-cols-2 gap-3 bg-slate-900 p-4 rounded-xl border border-slate-700">
            <div className="flex flex-col items-center justify-center border-r border-slate-700 pr-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Target Color</p>
              <div className="w-14 h-14 rounded-xl border-2 border-white shadow-md mb-1" style={{ backgroundColor: targetColor }} />
              <span className="text-xs font-mono font-bold text-slate-300">{targetColor}</span>
            </div>
            
            <div className="flex flex-col items-center justify-center pl-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Your Scan</p>
              <div 
                className="w-14 h-14 rounded-xl border-2 border-slate-600 shadow-md mb-1 flex items-center justify-center text-xs font-semibold text-slate-500 bg-slate-800"
                style={{ backgroundColor: scannedColor || 'transparent' }}
              >
                {!scannedColor && '?'}
              </div>
              <span className="text-xs font-mono font-bold text-slate-300">{scannedColor || '----'}</span>
            </div>
          </div>

          {/* Camera Feed Window */}
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

          {/* EVALUATION RESULTS CARD PANEL */}
          {hasCalculated && (
            <div className={`p-4 rounded-xl border text-center font-bold animate-fade-in ${
              isMatch 
                ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' 
                : 'bg-rose-500/10 border-rose-500 text-rose-400'
            }`}>
              {isMatch ? (
                <div>
                  <p className="text-lg">🎯 Match Found! Beautifully Done!</p>
                  <button 
                    onClick={generateNextChallenge}
                    className="mt-2 text-xs bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-1.5 px-4 rounded-lg transition-all cursor-pointer"
                  >
                    Next Target Challenge
                  </button>
                </div>
              ) : (
                <div>
                  <p className="text-lg">❌ Shade Variance Too High. Try Again!</p>
                  <p className="text-xs font-normal text-slate-400 mt-1">Adjust your proximity or ambient lighting.</p>
                </div>
              )}
            </div>
          )}

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