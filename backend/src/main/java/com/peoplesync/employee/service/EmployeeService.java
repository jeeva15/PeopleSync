package com.peoplesync.employee.service;

import com.peoplesync.employee.dto.*;
import com.peoplesync.employee.error.*;
import com.peoplesync.employee.model.*;
import com.peoplesync.employee.repository.*;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Locale;
import java.util.Set;

@Service
public class EmployeeService {
    private static final Set<String> ALLOWED_SORTS = Set.of("id", "fullName", "email", "jobTitle", "status", "joiningDate", "createdAt", "updatedAt");
    private final EmployeeRepository employees;
    private final DepartmentRepository departments;

    public EmployeeService(EmployeeRepository employees, DepartmentRepository departments) {
        this.employees = employees;
        this.departments = departments;
    }

    @Transactional(readOnly = true)
    public PageResponse<EmployeeResponse> findAll(int page, int pageSize, String search, Long departmentId,
                                                   EmployeeStatus status, String sort, Sort.Direction direction) {
        if (!ALLOWED_SORTS.contains(sort)) throw new BusinessRuleException("Unsupported sort field");
        String normalizedSearch = normalizeOptional(search);
        Pageable pageable = PageRequest.of(page - 1, pageSize, Sort.by(direction, sort));
        Page<Employee> result = employees.findAll(EmployeeSpecifications.matches(normalizedSearch, departmentId, status), pageable);
        return new PageResponse<>(result.getContent().stream().map(this::toResponse).toList(),
                page, pageSize, result.getTotalElements(), result.getTotalPages());
    }

    @Transactional(readOnly = true)
    public EmployeeResponse findById(long id) { return toResponse(requireEmployee(id)); }

    @Transactional
    public EmployeeResponse create(EmployeeRequest request) {
        String email = normalizeEmail(request.email());
        if (employees.existsByEmailIgnoreCase(email)) throw new ConflictException("An employee with this email already exists");
        Department department = requireActiveDepartment(request.departmentId());
        Employee employee = new Employee(clean(request.fullName()), email, department, clean(request.jobTitle()),
                request.status(), request.joiningDate());
        return toResponse(employees.save(employee));
    }

    @Transactional
    public EmployeeResponse update(long id, EmployeeRequest request) {
        Employee employee = requireEmployee(id);
        String email = normalizeEmail(request.email());
        if (employees.existsByEmailIgnoreCaseAndIdNot(email, id)) throw new ConflictException("An employee with this email already exists");
        Department department = requireActiveDepartment(request.departmentId());
        employee.update(clean(request.fullName()), email, department, clean(request.jobTitle()), request.status(), request.joiningDate());
        return toResponse(employee);
    }

    @Transactional
    public void deactivate(long id) { requireEmployee(id).deactivate(); }

    private Employee requireEmployee(long id) {
        return employees.findById(id).orElseThrow(() -> new ResourceNotFoundException("Employee not found"));
    }

    private Department requireActiveDepartment(long id) {
        Department department = departments.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found"));
        if (department.getStatus() != DepartmentStatus.ACTIVE)
            throw new BusinessRuleException("Employees can only be assigned to an active department");
        return department;
    }

    private EmployeeResponse toResponse(Employee e) {
        return new EmployeeResponse(e.getId(), e.getFullName(), e.getEmail(),
                new EmployeeResponse.DepartmentSummary(e.getDepartment().getId(), e.getDepartment().getName()),
                e.getJobTitle(), e.getStatus(), e.getJoiningDate(), e.getCreatedAt(), e.getUpdatedAt());
    }

    private static String normalizeEmail(String value) { return value.strip().toLowerCase(Locale.ROOT); }
    private static String clean(String value) { return value.strip().replaceAll("\\s+", " "); }
    private static String normalizeOptional(String value) {
        if (value == null) return null;
        String result = value.strip().replaceAll("\\s+", " ");
        return result.isEmpty() ? null : result;
    }
}
