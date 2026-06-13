import React, { useState } from 'react'

function App() {
  // State variables: These are like internal memory values for our app.
  // When these values change, React automatically updates only that specific part of the UI.
  const [hasStarted, setHasStarted] = useState(false)
  const [targetColor, setTargetColor] = useState('#34D399') // Defaults to a nice Emerald Green

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white p-4">
      
      {/* LANDING SCREEN: Only shows if the game hasn't started yet */}
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
        /* GAMEPLAY SCREN */
        <div className="bg-slate-800 p-6 rounded-2xl shadow-2xl max-w-md w-full border border-slate-700 flex flex-col gap-4">
          
          {/* Header section with current target challenge */}
          <div className="flex items-center justify-between bg-slate-900 p-4 rounded-xl border border-slate-700">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Target Color</p>
              <h2 className="text-lg font-bold">Find this shade!</h2>
            </div>
            {/* Display box showing the actual target color visually */}
            <div 
              className="w-12 h-12 rounded-xl border-2 border-white shadow-inner" 
              style={{ backgroundColor: targetColor }}
            />
          </div>

          {/* Camera View Window placeholder */}
          <div className="relative aspect-video bg-black rounded-xl overflow-hidden border border-slate-700 flex items-center justify-center">
            <p className="text-sm text-slate-500">Camera feed will link here...</p>
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