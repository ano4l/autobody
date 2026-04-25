package com.autobody.inventory.part.dto;

import java.util.List;

public record CsvImportResult(
        int totalRows,
        int created,
        int updated,
        int skipped,
        List<String> errors
) {}
