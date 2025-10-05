"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Download, Link2, CheckCircle2, AlertTriangle, XCircle } from "lucide-react"
import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

interface AnalysisStepProps {
  onBack: () => void
  onAnalyzeAgain?: () => void
  report?: any
}

export function AnalysisStep({ onBack, onAnalyzeAgain, report }: AnalysisStepProps) {
  const overallScore =
    report?.overallScore ?? report?.overall_score ?? report?.scores?.overall ?? 0

  const subScores =
    report?.subScores ??
    report?.sub_scores ??
    (report?.scores
      ? [
          { label: "Coverage", score: report.scores.coverage ?? 0 },
          { label: "Data Quality", score: report.scores.data ?? 0 },
          { label: "Rules Compliance", score: report.scores.rules ?? 0 },
          { label: "API Posture", score: report.scores.posture ?? 0 },
        ]
      : [])

  const fieldCoverage =
    report?.fieldCoverage ??
    report?.field_coverage ??
    (report?.coverage
      ? {
          matched: report.coverage.matched ?? [],
          closeMatches: report.coverage.close ?? [],
          missing: report.coverage.missing ?? [],
        }
      : { matched: [], closeMatches: [], missing: [] })

  const ruleFindingsRaw = report?.ruleFindings ?? report?.rule_findings ?? report?.ruleFindings ?? report?.rule_findings ?? report?.ruleFindings
  // Backend uses { rule: string, ok: boolean } — map to { name, passed, detail }
  const ruleFindings = (report?.ruleFindings || report?.rule_findings || report?.ruleFindings || report?.rule_findings)
    ? (report.ruleFindings || report.rule_findings).map((r: any) => ({ name: r.rule ?? r.name, passed: r.ok ?? r.passed ?? false, detail: r.detail ?? null }))
    : []
  const handleDownload = () => {
    const data = report ?? { overallScore, subScores, fieldCoverage, ruleFindings }
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "readiness-report.json"
    a.click()
  }

  const handleCopyLink = () => {
    const reportId = report?.reportId ?? report?.report_id
    const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
    if (reportId) {
      const url = `${base}/report/${encodeURIComponent(reportId)}`
      if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
        navigator.clipboard
          .writeText(url)
          .then(() => setCopyStatus("copied"))
          .catch(() => fallbackCopyText(url))
      } else {
        fallbackCopyText(url)
      }
    } else {
      const url = window.location.href
      if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
        navigator.clipboard
          .writeText(url)
          .then(() => setCopyStatus("copied"))
          .catch(() => fallbackCopyText(url))
      } else {
        fallbackCopyText(url)
      }
    }
  }

  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">("idle")

  const fallbackCopyText = (text: string) => {
    try {
      const textarea = document.createElement("textarea")
      textarea.value = text
      textarea.style.position = "fixed"
      textarea.style.left = "-9999px"
      document.body.appendChild(textarea)
      textarea.focus()
      textarea.select()
      const success = document.execCommand("copy")
      document.body.removeChild(textarea)
      setCopyStatus(success ? "copied" : "error")
    } catch (e) {
      setCopyStatus("error")
    }
  }

  return (
  <div className="space-y-6">
      <div className="flex justify-end gap-2">
        <Button onClick={handleDownload} variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Download Report (JSON)
        </Button>
        <div className="flex items-center gap-3">
          <Button onClick={handleCopyLink} variant="outline" size="sm">
            <Link2 className="w-4 h-4 mr-2" />
            Copy Shareable Link
          </Button>
          {copyStatus === "copied" && <span className="text-sm text-green-600">Copied!</span>}
          {copyStatus === "error" && <span className="text-sm text-red-600">Copy failed</span>}
        </div>
      </div>

      <Card className="p-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-8 text-center">Overall Readiness Score</h2>
        <div className="flex justify-center mb-12">
          <div className="relative w-48 h-48">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="96"
                cy="96"
                r="88"
                stroke="currentColor"
                strokeWidth="12"
                fill="none"
                className="text-gray-200"
              />
              <circle
                cx="96"
                cy="96"
                r="88"
                stroke="currentColor"
                strokeWidth="12"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 88}`}
                strokeDashoffset={`${2 * Math.PI * 88 * (1 - overallScore / 100)}`}
                className="text-blue-600 transition-all duration-1000"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-bold text-gray-900">{overallScore}</span>
              <span className="text-gray-500 text-sm">/100</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {subScores.map((item: any) => (
            <div key={item.label}>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">{item.label}</span>
                <span className="text-sm font-semibold text-gray-900">{item.score}%</span>
              </div>
              <Progress value={item.score} className="h-2" />
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Field Coverage</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              Matched Fields
            </h3>
            <ul className="space-y-2">
              {fieldCoverage.matched.map((field: string) => (
                <li key={field} className="text-sm text-gray-600 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-600" />
                  {field}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              Close Matches
            </h3>
            <ul className="space-y-2">
              {fieldCoverage.closeMatches.map((match: any) => (
                <li key={match.from} className="text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-600" />
                    <span>
                      {match.from} → {match.to}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-600" />
              Missing Fields
            </h3>
            <ul className="space-y-2">
              {fieldCoverage.missing.map((field: string) => (
                <li key={field} className="text-sm text-gray-600 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-600" />
                  {field}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Card>

      <Card className="p-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Rule Findings</h2>
        <div className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rule</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ruleFindings.map((finding: any) => {
                const detail = finding.detail ?? finding.value ?? (finding.exampleLine ? `Error on line ${finding.exampleLine}` : null)
                return (
                  <TableRow key={finding.name}>
                    <TableCell className="font-medium">{finding.name}</TableCell>
                    <TableCell>
                      <Badge variant={finding.passed ? "default" : "destructive"}>{finding.passed ? "Pass" : "Fail"}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-red-500">{finding.passed ? "-" : detail ?? '-'}</TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </Card>

      <div className="flex justify-between">
        <div>
          <Button onClick={onBack} variant="outline">
            Back
          </Button>
        </div>
        <div>
          <Button onClick={onAnalyzeAgain} className="ml-2">
            Analyze Again
          </Button>
        </div>
      </div>
    </div>
  )
}
