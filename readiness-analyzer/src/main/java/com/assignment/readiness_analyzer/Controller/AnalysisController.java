package com.assignment.readiness_analyzer.Controller;

import com.assignment.readiness_analyzer.Report;
import com.assignment.readiness_analyzer.Upload;
import com.assignment.readiness_analyzer.Repository.ReportRepository;
import com.assignment.readiness_analyzer.Repository.UploadRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;

import com.assignment.readiness_analyzer.Service.AnalysisService;
import com.fasterxml.jackson.databind.ObjectMapper; // For converting map to string

@RestController
public class AnalysisController {

    private final UploadRepository uploadRepository;
    private final ReportRepository reportRepository;
    private final AnalysisService analysisService;

    public AnalysisController(UploadRepository uploadRepository, ReportRepository reportRepository, AnalysisService analysisService) {
        this.uploadRepository = uploadRepository;
        this.reportRepository = reportRepository;
        this.analysisService = analysisService;
    }

    @PostMapping(value = "/upload", consumes = "multipart/form-data")
    public ResponseEntity<Map<String, String>> handleFileUpload(@RequestParam("file") MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "File is empty."));
        }
        return saveUpload(new String(file.getBytes()), file.getOriginalFilename());
    }

    @PostMapping(value = "/upload", consumes = "application/json")
    public ResponseEntity<Map<String, String>> handleTextUpload(@RequestBody Map<String, String> textPayload) {
        String content = textPayload.get("text");
        if (content == null || content.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Text content is missing."));
        }
        return saveUpload(content, "pasted_text.json");
    }

    private ResponseEntity<Map<String, String>> saveUpload(String content, String filename) {
        String uploadId = "u_" + UUID.randomUUID().toString();
        Upload newUpload = new Upload();
        newUpload.setId(uploadId);
        newUpload.setRawContent(content);
        newUpload.setFilename(filename);

        uploadRepository.save(newUpload);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("uploadId", uploadId));
    }

    @PostMapping("/analyze")
    public ResponseEntity<?> analyzeUpload(@RequestBody Map<String, Object> payload) {
        String uploadId = (String) payload.get("uploadId");
        if (uploadId == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "uploadId is required."));
        }

        // 1. Get questionnaire from payload
        @SuppressWarnings("unchecked")
        Map<String, Boolean> questionnaire = (Map<String, Boolean>) payload.get("questionnaire");

        // 2. Find the uploaded data in the database
        return uploadRepository.findById(uploadId)
                .map(upload -> {
                    try {
                        // 3. Run the analysis
                        Map<String, Object> reportMap = analysisService.analyzeData(upload.getRawContent(), questionnaire);

                        String reportId = "r_" + UUID.randomUUID().toString();
                        reportMap.put("reportId", reportId);

                        // 4. Save the report to the database
                        Report newReport = new Report();
                        newReport.setId(reportId);
                        newReport.setUploadId(uploadId);

                        // Convert the final report map to a JSON string to store in the DB
                        ObjectMapper mapper = new ObjectMapper();
                        newReport.setReportJson(mapper.writeValueAsString(reportMap));

                        reportRepository.save(newReport);

                        // 5. Return the full report
                        return ResponseEntity.ok(reportMap);

                    } catch (Exception e) {
                        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Failed during analysis: " + e.getMessage()));
                    }
                })
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Upload not found.")));
    }

    @GetMapping("/report/{reportId}")
    public ResponseEntity<?> getReport(@PathVariable String reportId) {
        return reportRepository.findById(reportId)
                .map(report -> ResponseEntity.ok()
                        .header("Content-Type", "application/json")
                        .body(report.getReportJson()))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("{\"error\":\"Report not found.\"}"));
    }
}