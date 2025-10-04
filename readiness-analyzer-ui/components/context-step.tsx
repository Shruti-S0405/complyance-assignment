"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface ContextStepProps {
  onNext: () => void
}

export function ContextStep({ onNext }: ContextStepProps) {
  return (
    <Card className="p-12 flex flex-col items-center justify-center text-center space-y-4">
      <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">ComplySense</h1>
      <h2 className="text-lg md:text-2xl font-medium text-gray-700">E‑Invoicing Readiness & Gap Analyzer</h2>
      <p className="text-base md:text-lg text-gray-600 max-w-2xl leading-relaxed">
        ComplySense helps organizations assess and improve their E‑Invoicing compliance.
        Upload CSV or JSON files, run automated checks, and share structured reports instantly.
      </p>
      <Button onClick={onNext} size="lg" className="bg-blue-600 hover:bg-blue-700">
        Start Analysis
      </Button>
    </Card>
  )
}
