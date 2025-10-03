package com.assignment.readiness_analyzer.Service;

import com.assignment.readiness_analyzer.Model.Invoice;
import com.assignment.readiness_analyzer.Model.Line;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.opencsv.CSVReader;
import com.opencsv.bean.CsvToBean;
import com.opencsv.bean.HeaderColumnNameTranslateMappingStrategy;
import org.springframework.stereotype.Service;

import java.io.StringReader;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class AnalysisService {

    private static final List<String> ALLOWED_CURRENCIES = Arrays.asList("AED", "SAR", "MYR", "USD"); //
    private static final Pattern ISO_DATE_PATTERN = Pattern.compile("^\\d{4}-\\d{2}-\\d{2}$");

    public Map<String, Object> analyzeData(String fileContent, Map<String, Boolean> questionnaire) {
        List<Invoice> invoices = parseInvoices(fileContent);
        if (invoices.size() > 200) {
            invoices = invoices.subList(0, 200); // Cap at 200 rows
        }

        List<Map<String, Object>> ruleFindings = checkAllRules(invoices);
        Map<String, Object> coverage = analyzeCoverage(invoices);
        Map<String, Integer> scores = calculateScores(invoices, coverage, ruleFindings, questionnaire);

        Map<String, Object> report = new HashMap<>();
        report.put("scores", scores);
        report.put("coverage", coverage);
        report.put("ruleFindings", ruleFindings);
        report.put("meta", Map.of("rowsParsed", invoices.size()));

        return report;
    }

    // Replace your entire parseInvoices method with this one
    private List<Invoice> parseInvoices(String content) {
        ObjectMapper mapper = new ObjectMapper();
        // First, try to parse it as JSON
        try {
            List<Invoice> invoices = mapper.readValue(content, new TypeReference<>() {});
            for (int i = 0; i < invoices.size(); i++) {
                invoices.get(i).setOriginalLineNumber(i + 1);
            }
            return invoices;
        } catch (Exception jsonException) {
            // If JSON parsing fails, assume it's CSV
            try (CSVReader reader = new CSVReader(new StringReader(content))) {
                List<String[]> allRows = reader.readAll();
                if (allRows.size() < 2) return new ArrayList<>(); // No data rows

                String[] headers = allRows.get(0);
                Map<String, Integer> headerIndexMap = new HashMap<>();
                for (int i = 0; i < headers.length; i++) {
                    headerIndexMap.put(headers[i].trim(), i);
                }

                Map<String, Invoice> invoiceMap = new HashMap<>();
                for (int i = 1; i < allRows.size(); i++) {
                    String[] row = allRows.get(i);
                    String invId = row[headerIndexMap.get("inv_no")];

                    // --- THIS IS THE CORRECTED LOGIC ---
                    Invoice invoice = invoiceMap.get(invId);
                    if (invoice == null) {
                        invoice = new Invoice();
                        invoice.setId(invId);
                        invoice.setIssueDate(row[headerIndexMap.get("issued_on")]);
                        invoice.setCurrency(row[headerIndexMap.get("curr")]);
                        invoice.setSellerName(row[headerIndexMap.get("sellerName")]);
                        invoice.setSellerTrn(row[headerIndexMap.get("sellerTax")]);
                        invoice.setBuyerName(row[headerIndexMap.get("buyerName")]);
                        invoice.setBuyerTrn(row[headerIndexMap.get("buyerTax")]);
                        invoice.setTotalExclVat(new BigDecimal(row[headerIndexMap.get("totalNet")]));
                        invoice.setVatAmount(new BigDecimal(row[headerIndexMap.get("vat")]));
                        invoice.setTotalInclVat(new BigDecimal(row[headerIndexMap.get("grandTotal")]));
                        invoice.setLines(new ArrayList<>());
                        invoice.setOriginalLineNumber(i + 1); // Use the loop index directly
                        invoiceMap.put(invId, invoice);
                    }
                    // --- END OF CORRECTED LOGIC ---

                    Line line = new Line();
                    line.setSku(row[headerIndexMap.get("lineSku")]);
                    line.setQty(new BigDecimal(row[headerIndexMap.get("lineQty")]));
                    line.setUnitPrice(new BigDecimal(row[headerIndexMap.get("linePrice")]));
                    line.setLineTotal(new BigDecimal(row[headerIndexMap.get("lineTotal")]));
                    invoice.getLines().add(line);
                }
                return new ArrayList<>(invoiceMap.values());
            } catch (Exception csvException) {
                csvException.printStackTrace();
                return new ArrayList<>();
            }
        }
    }


    private List<Map<String, Object>> checkAllRules(List<Invoice> invoices) {
        List<Map<String, Object>> findings = new ArrayList<>();
        BigDecimal tolerance = new BigDecimal("0.01");

        // Rule 1: TOTALS_BALANCE
        boolean totalsOk = invoices.stream().allMatch(inv ->
                inv.getTotalExclVat().add(inv.getVatAmount()).subtract(inv.getTotalInclVat()).abs().compareTo(tolerance) <= 0
        );
        findings.add(Map.of("rule", "TOTALS_BALANCE", "ok", totalsOk)); //

        // Rule 2: LINE_MATH
        Invoice firstLineMathError = invoices.stream().filter(inv ->
                inv.getLines().stream().anyMatch(line ->
                        line.getQty().multiply(line.getUnitPrice()).subtract(line.getLineTotal()).abs().compareTo(tolerance) > 0
                )
        ).findFirst().orElse(null);
        if (firstLineMathError != null) {
            findings.add(Map.of("rule", "LINE_MATH", "ok", false, "exampleLine", firstLineMathError.getOriginalLineNumber())); //
        } else {
            findings.add(Map.of("rule", "LINE_MATH", "ok", true)); //
        }

        // Rule 3: DATE_ISO
        boolean datesOk = invoices.stream().allMatch(inv -> ISO_DATE_PATTERN.matcher(inv.getIssueDate()).matches());
        findings.add(Map.of("rule", "DATE_ISO", "ok", datesOk)); //

        // Rule 4: CURRENCY_ALLOWED
        Invoice badCurrencyInvoice = invoices.stream()
                .filter(inv -> !ALLOWED_CURRENCIES.contains(inv.getCurrency()))
                .findFirst().orElse(null);
        if (badCurrencyInvoice != null) {
            findings.add(Map.of("rule", "CURRENCY_ALLOWED", "ok", false, "value", badCurrencyInvoice.getCurrency())); //
        } else {
            findings.add(Map.of("rule", "CURRENCY_ALLOWED", "ok", true)); //
        }

        // Rule 5: TRN_PRESENT
        boolean trnOk = invoices.stream().allMatch(inv ->
                inv.getBuyerTrn() != null && !inv.getBuyerTrn().isBlank() &&
                        inv.getSellerTrn() != null && !inv.getSellerTrn().isBlank()
        );
        findings.add(Map.of("rule", "TRN_PRESENT", "ok", trnOk)); //

        return findings;
    }

    // Replace the old analyzeCoverage method with this one
    private Map<String, Object> analyzeCoverage(List<Invoice> invoices) {
        if (invoices.isEmpty()) {
            return Map.of("matched", List.of(), "close", List.of(), "missing", List.of("All fields missing"));
        }

        // This is still simplified, but better than a placeholder.
        // It checks for the presence of key fields in the first parsed invoice.
        Invoice firstInvoice = invoices.get(0);
        List<String> matched = new ArrayList<>();
        if (firstInvoice.getId() != null) matched.add("invoice.id");
        if (firstInvoice.getIssueDate() != null) matched.add("invoice.issue_date");
        if (firstInvoice.getCurrency() != null) matched.add("invoice.currency");
        if (firstInvoice.getBuyerTrn() != null) matched.add("buyer.trn");
        if (firstInvoice.getSellerTrn() != null) matched.add("seller.trn");

        return Map.of("matched", matched, "close", List.of(), "missing", List.of("...and more"));
    }

    private Map<String, Integer> calculateScores(List<Invoice> invoices, Map<String, Object> coverage, List<Map<String, Object>> ruleFindings, Map<String, Boolean> questionnaire) {
        int dataScore = invoices.isEmpty() ? 0 : 100;

        List<?> matched = (List<?>) coverage.get("matched");
        int coverageScore = (int) Math.round(((double) matched.size() / 15) * 100); // Simplified: 15 is approx GETS keys

        long passedRules = ruleFindings.stream().filter(r -> (Boolean) r.get("ok")).count();
        int rulesScore = (int) Math.round(((double) passedRules / ruleFindings.size()) * 100);

        long postureCount = questionnaire.values().stream().filter(v -> v).count();
        int postureScore = (int) Math.round(((double) postureCount / 3) * 100);

        int overall = (int) Math.round((dataScore * 0.25) + (coverageScore * 0.35) + (rulesScore * 0.30) + (postureScore * 0.10)); //

        Map<String, Integer> scores = new HashMap<>();
        scores.put("data", dataScore); //
        scores.put("coverage", coverageScore); //
        scores.put("rules", rulesScore); //
        scores.put("posture", postureScore); //
        scores.put("overall", overall); //

        return scores;
    }
}