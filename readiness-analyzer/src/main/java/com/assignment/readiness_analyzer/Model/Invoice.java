package com.assignment.readiness_analyzer.Model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
@Data
public class Invoice {
    private String id;

    @JsonProperty("date")
    private String issueDate;

    private String currency;

    @JsonProperty("seller_name")
    private String sellerName;

    @JsonProperty("seller_trn")
    private String sellerTrn;

    @JsonProperty("buyer_name")
    private String buyerName;

    @JsonProperty("buyer_trn")
    private String buyerTrn;

    @JsonProperty("total_excl_vat")
    private BigDecimal totalExclVat;

    @JsonProperty("vat_amount")
    private BigDecimal vatAmount;

    @JsonProperty("total_incl_vat")
    private BigDecimal totalInclVat;

    private List<Line> lines;

    @JsonProperty("original_line_number")
    private int originalLineNumber;
}
