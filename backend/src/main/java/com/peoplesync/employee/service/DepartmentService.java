package com.peoplesync.employee.service;

import com.peoplesync.employee.dto.DepartmentResponse;
import com.peoplesync.employee.error.ResourceNotFoundException;
import com.peoplesync.employee.model.DepartmentStatus;
import com.peoplesync.employee.repository.DepartmentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class DepartmentService {
    private final DepartmentRepository repository;

    public DepartmentService(DepartmentRepository repository) { this.repository = repository; }

    public List<DepartmentResponse> findAll(boolean activeOnly) {
        var departments = activeOnly
                ? repository.findByStatusOrderByNameAsc(DepartmentStatus.ACTIVE)
                : repository.findAllByOrderByNameAsc();
        return departments.stream().map(d -> new DepartmentResponse(
                d.getId(), d.getName(), d.getStatus(), d.getCreatedAt(), d.getUpdatedAt())).toList();
    }

    public DepartmentResponse findById(long id) {
        var d = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found"));
        return new DepartmentResponse(d.getId(), d.getName(), d.getStatus(), d.getCreatedAt(), d.getUpdatedAt());
    }
}
