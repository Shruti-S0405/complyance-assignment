package com.assignment.readiness_analyzer;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.Instant;

@Entity
@Table(name = "uploads")
@Data
@NoArgsConstructor
public class Upload {
    @Id
    private String id;
    private Instant createdAt = Instant.now();
    @Lob
    private String rawContent;
    private String filename;
}