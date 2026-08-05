package com.peoplesync.employee.controller;

import com.peoplesync.employee.dto.DepartmentResponse;
import com.peoplesync.employee.service.DepartmentService;
import jakarta.validation.constraints.Positive;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@Validated
@RestController
@RequestMapping("/api/v1/departments")
public class DepartmentController {
    private final DepartmentService service;
    public DepartmentController(DepartmentService service) { this.service = service; }

    @GetMapping
    public List<DepartmentResponse> findAll(@RequestParam(defaultValue = "false") boolean activeOnly) {
        return service.findAll(activeOnly);
    }

    @GetMapping("/{id}")
    public DepartmentResponse findById(@PathVariable @Positive long id) { return service.findById(id); }
}
