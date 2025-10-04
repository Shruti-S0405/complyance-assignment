import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface StepperProps {
  currentStep: number
}

const steps = [
  { number: 1, label: "Context" },
  { number: 2, label: "Upload & Preview" },
  { number: 3, label: "Analysis Report" },
]

export function Stepper({ currentStep }: StepperProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors",
                  currentStep > step.number
                    ? "bg-blue-600 text-white"
                    : currentStep === step.number
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-600",
                )}
              >
                {currentStep > step.number ? <Check className="w-5 h-5" /> : step.number}
              </div>
              <span
                className={cn(
                  "mt-2 text-sm font-medium",
                  currentStep >= step.number ? "text-blue-600" : "text-gray-500",
                )}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "h-0.5 flex-1 mx-4 transition-colors",
                  currentStep > step.number ? "bg-blue-600" : "bg-gray-200",
                )}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
