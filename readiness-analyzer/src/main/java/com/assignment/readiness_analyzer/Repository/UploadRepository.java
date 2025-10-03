package com.assignment.readiness_analyzer.Repository;

import com.assignment.readiness_analyzer.Upload;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UploadRepository extends JpaRepository<Upload, String> {
}