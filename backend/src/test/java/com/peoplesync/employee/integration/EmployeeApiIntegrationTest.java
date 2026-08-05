package com.peoplesync.employee.integration;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.peoplesync.employee.dto.EmployeeRequest;
import com.peoplesync.employee.model.Department;
import com.peoplesync.employee.model.DepartmentStatus;
import com.peoplesync.employee.model.Employee;
import com.peoplesync.employee.model.EmployeeStatus;
import com.peoplesync.employee.repository.DepartmentRepository;
import com.peoplesync.employee.repository.EmployeeRepository;

/**
 * Exercises the complete HTTP, validation, controller, service and exception
 * handling flow while mocking only the persistence boundary.
 */
@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:api_integration;MODE=MySQL;DB_CLOSE_DELAY=-1",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.flyway.enabled=false",
        "spring.jpa.hibernate.ddl-auto=none",
        "spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.H2Dialect"
})
@AutoConfigureMockMvc
class EmployeeApiIntegrationTest {
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper mapper;
    @MockitoBean EmployeeRepository employeeRepository;
    @MockitoBean DepartmentRepository departmentRepository;

    private Department engineering;
    private Employee employee;

    @BeforeEach
    void setUp() {
        engineering = mock(Department.class);
        when(engineering.getId()).thenReturn(2L);
        when(engineering.getName()).thenReturn("Engineering");
        when(engineering.getStatus()).thenReturn(DepartmentStatus.ACTIVE);

        employee = mock(Employee.class);
        when(employee.getId()).thenReturn(7L);
        when(employee.getFullName()).thenReturn("Aisha Tan");
        when(employee.getEmail()).thenReturn("aisha@example.com");
        when(employee.getDepartment()).thenReturn(engineering);
        when(employee.getJobTitle()).thenReturn("Engineer");
        when(employee.getStatus()).thenReturn(EmployeeStatus.ACTIVE);
        when(employee.getJoiningDate()).thenReturn(LocalDate.of(2023, 4, 17));
    }

    @Test void retrievesEmployeeThroughTheCompleteApiStack() throws Exception {
        when(employeeRepository.findById(7L)).thenReturn(Optional.of(employee));

        mvc.perform(get("/api/v1/employees/7"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(7))
                .andExpect(jsonPath("$.fullName").value("Aisha Tan"))
                .andExpect(jsonPath("$.department.name").value("Engineering"));

        verify(employeeRepository).findById(7L);
    }

    @Test void rejectsDuplicateEmailThroughTheCompleteApiStack() throws Exception {
        when(employeeRepository.existsByEmailIgnoreCase("aisha@example.com")).thenReturn(true);
        var request = new EmployeeRequest("Aisha Tan", "AISHA@example.com", 2L,
                "Engineer", EmployeeStatus.ACTIVE, LocalDate.of(2023, 4, 17));

        mvc.perform(post("/api/v1/employees")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsBytes(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message")
                        .value("An employee with this email already exists"));

        verify(departmentRepository, never()).findById(any());
        verify(employeeRepository, never()).save(any());
    }

    @Test void retrievesDepartmentsThroughTheCompleteApiStack() throws Exception {
        when(departmentRepository.findByStatusOrderByNameAsc(DepartmentStatus.ACTIVE))
                .thenReturn(List.of(engineering));

        mvc.perform(get("/api/v1/departments").param("activeOnly", "true"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(2))
                .andExpect(jsonPath("$[0].name").value("Engineering"));
    }
}
