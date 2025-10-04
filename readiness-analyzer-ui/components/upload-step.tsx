"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Upload, FileText } from "lucide-react"
import { cn } from "@/lib/utils"

interface UploadStepProps {
  onNext: () => void
  onBack: () => void
  onAnalyze: (file: File) => void
  onDataUpload?: (data: any[]) => void
  uploadedData: any[]
}

export function UploadStep({ onNext, onBack, onAnalyze, onDataUpload, uploadedData }: UploadStepProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [fileName, setFileName] = useState<string>("")
  const [file, setFile] = useState<File | null>(null)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) {
      setFileName(file.name)
      setFile(file)
      // try to read JSON or CSV for preview
      file.text()
        .then((txt) => {
          // try JSON first
          try {
            const parsed = JSON.parse(txt)
            if (Array.isArray(parsed) && typeof onDataUpload === "function") {
              onDataUpload(parsed)
              return
            }
          } catch (err) {
            // not JSON -> try CSV below
          }

          // Simple CSV parser (handles quoted fields)
          const parseCSV = (text: string) => {
            const lines = text.split(/\r?\n/).filter((l) => l.trim() !== "")
            if (lines.length === 0) return []

            const splitLine = (line: string) => {
              const res: string[] = []
              let cur = ""
              let inQuotes = false
              for (let i = 0; i < line.length; i++) {
                const ch = line[i]
                if (ch === '"') {
                  if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
                    // escaped quote
                    cur += '"'
                    i++
                  } else {
                    inQuotes = !inQuotes
                  }
                } else if (ch === ',' && !inQuotes) {
                  res.push(cur)
                  cur = ""
                } else {
                  cur += ch
                }
              }
              res.push(cur)
              return res
            }

            const headers = splitLine(lines[0]).map((h) => h.trim())
            const rows = lines.slice(1).map((ln) => {
              const cols = splitLine(ln)
              const obj: Record<string, any> = {}
              for (let i = 0; i < headers.length; i++) {
                const key = headers[i] || `col_${i}`
                let val: any = cols[i] === undefined ? "" : cols[i]
                // try to convert numbers
                if (/^-?\d+(?:\.\d+)?$/.test(val)) {
                  const num = Number(val)
                  val = Number.isNaN(num) ? val : num
                }
                obj[key] = val
              }
              return obj
            })

            return rows
          }

          try {
            const parsedCsv = parseCSV(txt)
            if (parsedCsv.length > 0 && typeof onDataUpload === "function") {
              onDataUpload(parsedCsv)
            }
          } catch (err) {
            // ignore parse error
          }
        })
    }
  }, [])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFileName(file.name)
      setFile(file)
      file.text()
        .then((txt) => {
          try {
            const parsed = JSON.parse(txt)
            if (Array.isArray(parsed) && typeof onDataUpload === "function") {
              onDataUpload(parsed)
              return
            }
          } catch (err) {
            // not JSON -> try CSV
          }

          // parse CSV (same logic as above)
          const parseCSV = (text: string) => {
            const lines = text.split(/\r?\n/).filter((l) => l.trim() !== "")
            if (lines.length === 0) return []

            const splitLine = (line: string) => {
              const res: string[] = []
              let cur = ""
              let inQuotes = false
              for (let i = 0; i < line.length; i++) {
                const ch = line[i]
                if (ch === '"') {
                  if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
                    cur += '"'
                    i++
                  } else {
                    inQuotes = !inQuotes
                  }
                } else if (ch === ',' && !inQuotes) {
                  res.push(cur)
                  cur = ""
                } else {
                  cur += ch
                }
              }
              res.push(cur)
              return res
            }

            const headers = splitLine(lines[0]).map((h) => h.trim())
            const rows = lines.slice(1).map((ln) => {
              const cols = splitLine(ln)
              const obj: Record<string, any> = {}
              for (let i = 0; i < headers.length; i++) {
                const key = headers[i] || `col_${i}`
                let val: any = cols[i] === undefined ? "" : cols[i]
                if (/^-?\d+(?:\.\d+)?$/.test(val)) {
                  const num = Number(val)
                  val = Number.isNaN(num) ? val : num
                }
                obj[key] = val
              }
              return obj
            })

            return rows
          }

          try {
            const parsedCsv = parseCSV(txt)
            if (parsedCsv.length > 0 && typeof onDataUpload === "function") {
              onDataUpload(parsedCsv)
            }
          } catch (err) {
            // ignore
          }
        })
    }
  }, [])

  // no local mock generation — the selected File is emitted via onAnalyze

  const getColumnType = (key: string): { type: string; color: string } => {
    if (key.includes("date")) return { type: "date", color: "bg-orange-100 text-orange-700" }
    if (key.includes("amount") || key.includes("total")) return { type: "number", color: "bg-green-100 text-green-700" }
    return { type: "text", color: "bg-blue-100 text-blue-700" }
  }

  return (
    <div className="space-y-6">
      <Card className="p-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Upload Invoice Data</h2>
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "border-2 border-dashed rounded-lg p-12 text-center transition-colors cursor-pointer",
            isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400",
          )}
        >
          <input type="file" accept=".csv,.json" onChange={handleFileInput} className="hidden" id="file-upload" />
          <label htmlFor="file-upload" className="cursor-pointer">
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-700 mb-2">
              {fileName || "Drop your file here or click to browse"}
            </p>
            <p className="text-sm text-gray-500">Supports CSV and JSON files</p>
          </label>
        </div>
        {fileName && (
          <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
            <FileText className="w-4 h-4" />
            <span>{fileName}</span>
          </div>
        )}
      </Card>

      {uploadedData.length > 0 && (
        <Card className="p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Data Preview</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  {Object.keys(uploadedData[0]).map((key) => {
                    const { type, color } = getColumnType(key)
                    return (
                      <th key={key} className="text-left py-3 px-4 font-semibold text-gray-700">
                        <div className="flex items-center gap-2">
                          <span>{key}</span>
                          <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", color)}>{type}</span>
                        </div>
                      </th>
                    )
                  })}
                </tr>
              </thead>
              <tbody>
                {uploadedData.slice(0, 20).map((row, i) => (
                  <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                    {Object.values(row).map((value, j) => (
                      <td key={j} className="py-3 px-4 text-sm text-gray-600">
                        {String(value)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

        <div className="flex justify-between">
          <Button onClick={onBack} variant="outline">
            Back
          </Button>
          <Button
            onClick={() => file && onAnalyze(file)}
            disabled={!file}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Analyze Data
          </Button>
        </div>
    </div>
  )
}
