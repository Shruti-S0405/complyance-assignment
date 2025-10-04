const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

type UploadResponse = { uploadId: string }

export async function uploadFile(file: File): Promise<UploadResponse> {
  const fd = new FormData()
  fd.append("file", file)

  const res = await fetch(`${BASE_URL}/upload`, {
    method: "POST",
    body: fd,
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Upload failed: ${res.status} ${text}`)
  }

  return res.json()
}

export async function analyze(uploadId: string, questionnaire: Record<string, any> = {}) {
  const res = await fetch(`${BASE_URL}/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ uploadId, questionnaire }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Analyze failed: ${res.status} ${text}`)
  }

  return res.json()
}

export async function getReport(reportId: string) {
  const res = await fetch(`${BASE_URL}/report/${encodeURIComponent(reportId)}`)
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Get report failed: ${res.status} ${text}`)
  }
  return res.json()
}

export default { uploadFile, analyze, getReport }
