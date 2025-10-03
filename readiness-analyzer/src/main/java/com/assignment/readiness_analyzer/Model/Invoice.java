package com.assignment.readiness_analyzer.Model;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class Invoice {
    private String id;
    private String issueDate;
    private String currency;
    private String sellerName;
    private String sellerTrn;
    private String buyerName;
    private String buyerTrn;
    private BigDecimal totalExclVat;
    private BigDecimal vatAmount;
    private BigDecimal totalInclVat;
    private List<Line> lines;

    // This field will help us track the original line number for error reporting
    private int originalLineNumber;
}