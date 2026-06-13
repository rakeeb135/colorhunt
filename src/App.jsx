import React from 'react'

function App() {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white p-4">
      <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl max-w-md w-full text-center border border-slate-700">
        <h1 className="text-3xl font-extrabold tracking-tight mb-2 text-emerald-400">
          ColorHunt 🎯
        </h1>
        <p className="text-slate-400 mb-6">
          Real-world environment color scanning game.
        </p>
        <button className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-3 px-6 rounded-xl transition-all duration-200 cursor-pointer shadow-lg shadow-emerald-500/20">
          Initialize Camera
        </button>
      </div>
    </div>
  )
}

export default App