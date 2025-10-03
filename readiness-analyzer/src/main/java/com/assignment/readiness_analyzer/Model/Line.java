package com.assignment.readiness_analyzer.Model;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class Line {
    private String sku;
    private String description;
    private BigDecimal qty;
    private BigDecimal unitPrice;
    private BigDecimal lineTotal;
}