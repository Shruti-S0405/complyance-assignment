package com.assignment.readiness_analyzer;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.Instant;

@Entity
@Table(name = "reports")
@Data
@NoArgsConstructor
public class Report {
    @Id
    private String id;
    private String uploadId;
    private Instant createdAt = Instant.now();
    @Lob
    private String reportJson;
}