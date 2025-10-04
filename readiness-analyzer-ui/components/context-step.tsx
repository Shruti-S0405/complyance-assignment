"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface ContextStepProps {
  onNext: () => void
}

export function ContextStep({ onNext }: ContextStepProps) {
  return (
    <Card className="p-12 text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-6 text-balance">E-Invoicing Readiness & Gap Analyzer</h1>
      <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8 leading-relaxed">
        This tool helps organizations quickly assess their invoice data against technical standards. Upload a sample of
        your invoices to receive a readiness score and a prioritized list of gaps to address.
      </p>
      <Button onClick={onNext} size="lg" className="bg-blue-600 hover:bg-blue-700">
        Start Analysis
      </Button>
    </Card>
  )
}
