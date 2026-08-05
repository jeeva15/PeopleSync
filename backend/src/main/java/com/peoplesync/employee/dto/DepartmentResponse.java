package com.peoplesync.employee.dto;

import com.peoplesync.employee.model.DepartmentStatus;
import java.time.Instant;

public record DepartmentResponse(Long id, String name, DepartmentStatus status, Instant createdAt, Instant updatedAt) {}
