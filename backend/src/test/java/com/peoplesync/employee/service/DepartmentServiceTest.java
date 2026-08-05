package com.peoplesync.employee.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;

import com.peoplesync.employee.error.ResourceNotFoundException;
import com.peoplesync.employee.model.Department;
import com.peoplesync.employee.model.DepartmentStatus;
import com.peoplesync.employee.repository.DepartmentRepository;

class DepartmentServiceTest {
    private final DepartmentRepository repository = mock(DepartmentRepository.class);
    private final DepartmentService service = new DepartmentService(repository);

    @Test void retrievesOnlyActiveDepartmentsWhenRequested() {
        when(repository.findByStatusOrderByNameAsc(DepartmentStatus.ACTIVE))
                .thenReturn(List.of(new Department("Engineering", DepartmentStatus.ACTIVE)));

        var result = service.findAll(true);

        assertEquals(1, result.size());
        assertEquals("Engineering", result.get(0).name());
        verify(repository).findByStatusOrderByNameAsc(DepartmentStatus.ACTIVE);
    }

    @Test void reportsMissingDepartment() {
        when(repository.findById(99L)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> service.findById(99L));
    }
}
