package com.peoplesync.employee.controller;

import com.peoplesync.employee.dto.*;
import com.peoplesync.employee.model.EmployeeStatus;
import com.peoplesync.employee.service.EmployeeService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.springframework.data.domain.Sort;
import org.springframework.http.*;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import java.net.URI;

@Validated
@RestController
@RequestMapping("/api/v1/employees")
public class EmployeeController {
    private final EmployeeService service;
    public EmployeeController(EmployeeService service) { this.service = service; }

    @GetMapping
    public PageResponse<EmployeeResponse> findAll(
            @RequestParam(defaultValue = "1") @Min(1) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int pageSize,
            @RequestParam(required = false) @Size(max = 150) String search,
            @RequestParam(required = false) @Positive Long departmentId,
            @RequestParam(required = false) EmployeeStatus status,
            @RequestParam(defaultValue = "id") String sort,
            @RequestParam(defaultValue = "asc") @Pattern(regexp = "(?i)asc|desc") String direction) {
        return service.findAll(page, pageSize, search, departmentId, status, sort,
                Sort.Direction.fromString(direction));
    }

    @GetMapping("/{id}")
    public EmployeeResponse findById(@PathVariable @Positive long id) { return service.findById(id); }

    @PostMapping
    public ResponseEntity<EmployeeResponse> create(@Valid @RequestBody EmployeeRequest request) {
        EmployeeResponse created = service.create(request);
        return ResponseEntity.created(URI.create("/api/v1/employees/" + created.id())).body(created);
    }

    @PutMapping("/{id}")
    public EmployeeResponse update(@PathVariable @Positive long id, @Valid @RequestBody EmployeeRequest request) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deactivate(@PathVariable @Positive long id) { service.deactivate(id); }
}
