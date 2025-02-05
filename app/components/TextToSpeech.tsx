"use client"

import { useState } from "react"
import { useSpeechSynthesis } from "react-speech-kit"
import { Play, Pause, CircleStopIcon as Stop } from "lucide-react"

interface TextToSpeechProps {
  text: string
}

export function TextToSpeech({ text }: TextToSpeechProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const { speak, cancel, speaking } = useSpeechSynthesis()

  const handlePlay = () => {
    if (!speaking) {
      speak({ text })
    }
    setIsPlaying(true)
  }

  const handlePause = () => {
    cancel()
    setIsPlaying(false)
  }

  const handleStop = () => {
    cancel()
    setIsPlaying(false)
  }

  return (
    <div className="flex items-center space-x-2 my-4">
      <button
        onClick={isPlaying ? handlePause : handlePlay}
        className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors"
      >
        {isPlaying ? <Pause size={20} /> : <Play size={20} />}
      </button>
      <button
        onClick={handleStop}
        className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
      >
        <Stop size={20} />
      </button>
    </div>
  )
}

