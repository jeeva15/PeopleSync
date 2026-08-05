package com.peoplesync.employee.service;

import com.peoplesync.employee.dto.EmployeeRequest;
import com.peoplesync.employee.error.*;
import com.peoplesync.employee.model.*;
import com.peoplesync.employee.repository.*;
import org.junit.jupiter.api.*;
import org.mockito.*;
import java.time.LocalDate;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class EmployeeServiceTest {
    @Mock EmployeeRepository employees;
    @Mock DepartmentRepository departments;
    EmployeeService service;

    @BeforeEach void setUp() {
        MockitoAnnotations.openMocks(this);
        service = new EmployeeService(employees, departments);
    }

    @Test void rejectsDuplicateEmailBeforeCreate() {
        var request = request(" USER@EXAMPLE.COM ", 1L);
        when(employees.existsByEmailIgnoreCase("user@example.com")).thenReturn(true);

        assertThrows(ConflictException.class, () -> service.create(request));
        verify(employees, never()).save(any());
    }

    @Test void rejectsAssignmentToInactiveDepartment() {
        var request = request("user@example.com", 1L);
        when(employees.existsByEmailIgnoreCase(anyString())).thenReturn(false);
        when(departments.findById(1L)).thenReturn(Optional.of(new Department("Legacy", DepartmentStatus.INACTIVE)));

        assertThrows(BusinessRuleException.class, () -> service.create(request));
        verify(employees, never()).save(any());
    }

    @Test void deleteDeactivatesInsteadOfRemovingEmployee() {
        var employee = new Employee("Test User", "user@example.com",
                new Department("Engineering", DepartmentStatus.ACTIVE), "Engineer", EmployeeStatus.ACTIVE, LocalDate.now());
        when(employees.findById(9L)).thenReturn(Optional.of(employee));

        service.deactivate(9L);

        assertEquals(EmployeeStatus.INACTIVE, employee.getStatus());
        verify(employees, never()).delete(any(Employee.class));
    }

    private EmployeeRequest request(String email, Long departmentId) {
        return new EmployeeRequest("Test User", email, departmentId, "Engineer", EmployeeStatus.ACTIVE, LocalDate.now());
    }
}
