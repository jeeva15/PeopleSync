package com.peoplesync.employee.dto;

import com.peoplesync.employee.model.EmployeeStatus;
import jakarta.validation.constraints.*;
import java.time.LocalDate;

public record EmployeeRequest(
        @NotBlank @Size(max = 150) @Pattern(regexp = "^[^\\p{Cntrl}]+$", message = "must not contain control characters") String fullName,
        @NotBlank @Size(max = 254) @Email String email,
        @NotNull @Positive Long departmentId,
        @NotBlank @Size(max = 100) @Pattern(regexp = "^[^\\p{Cntrl}]+$", message = "must not contain control characters") String jobTitle,
        @NotNull EmployeeStatus status,
        @NotNull LocalDate joiningDate
) {}
