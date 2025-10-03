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

@RestController
public class AnalysisController {

    private final UploadRepository uploadRepository;
    private final ReportRepository reportRepository;

    public AnalysisController(UploadRepository uploadRepository, ReportRepository reportRepository) {
        this.uploadRepository = uploadRepository;
        this.reportRepository = reportRepository;
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
        return ResponseEntity.ok().body("Milestone 3: Analysis logic will be implemented here.");
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