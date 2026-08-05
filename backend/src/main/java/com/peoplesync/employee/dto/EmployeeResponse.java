package com.peoplesync.employee.dto;

import com.peoplesync.employee.model.EmployeeStatus;
import java.time.Instant;
import java.time.LocalDate;

public record EmployeeResponse(
        Long id,
        String fullName,
        String email,
        DepartmentSummary department,
        String jobTitle,
        EmployeeStatus status,
        LocalDate joiningDate,
        Instant createdAt,
        Instant updatedAt
) {
    public record DepartmentSummary(Long id, String name) {}
}
