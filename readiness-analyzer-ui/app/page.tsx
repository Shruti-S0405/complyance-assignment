"use client"

import { useState } from "react"
import { ContextStep } from "@/components/context-step"
import { UploadStep } from "@/components/upload-step"
import { AnalysisStep } from "@/components/analysis-step"
import { Stepper } from "@/components/stepper"
import * as api from "@/lib/api"

export default function Home() {
  const [currentStep, setCurrentStep] = useState(1)
  const [uploadedData, setUploadedData] = useState<any[]>([])
  const [report, setReport] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleNext = () => {
    setCurrentStep((prev) => Math.min(prev + 1, 3))
  }

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  const handleDataUpload = (data: any[]) => {
    setUploadedData(data)
  }

  const handleAnalyze = async (file: File) => {
    setError(null)
    setLoading(true)
    try {
  const up = await api.uploadFile(file)
  const uploadId = (up as any).uploadId || (up as any).upload_id
      const questionnaire = { webhooks: true, sandbox_env: false, retries: true }
      const reportResp = await api.analyze(uploadId, questionnaire)
      setReport(reportResp)
      setCurrentStep(3)
    } catch (err: any) {
      setError(err?.message || String(err))
    } finally {
      setLoading(false)
    }
  }

  const handleAnalyzeAgain = () => {
    setReport(null)
    setUploadedData([])
    setCurrentStep(1)
    setError(null)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Stepper currentStep={currentStep} />

        <div className="mt-8">
          {currentStep === 1 && <ContextStep onNext={handleNext} />}
          {currentStep === 2 && (
            <UploadStep
              onNext={handleNext}
              onBack={handleBack}
              onAnalyze={handleAnalyze}
              onDataUpload={handleDataUpload}
              uploadedData={uploadedData}
            />
          )}
          {currentStep === 3 && (
            <AnalysisStep onBack={handleBack} onAnalyzeAgain={handleAnalyzeAgain} report={report ?? undefined} />
          )}
          {error && <div className="mt-4 text-red-600">{error}</div>}
          {loading && <div className="mt-4 text-gray-600">Processing... please wait</div>}
        </div>
      </div>
    </div>
  )
}
