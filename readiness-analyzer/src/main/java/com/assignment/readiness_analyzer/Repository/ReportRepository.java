package com.assignment.readiness_analyzer.Repository;

import com.assignment.readiness_analyzer.Report;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReportRepository extends JpaRepository<Report, String> {
}