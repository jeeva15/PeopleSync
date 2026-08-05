package com.peoplesync.employee.repository;

import com.peoplesync.employee.model.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.TestPropertySource;
import java.time.LocalDate;
import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@TestPropertySource(properties = {
        "spring.flyway.enabled=false",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.H2Dialect"
})
class EmployeeRepositoryIntegrationTest {
    @Autowired EmployeeRepository employees;
    @Autowired DepartmentRepository departments;

    @Test void persistsRelationshipAndFindsEmailCaseInsensitively() {
        Department department = departments.save(new Department("Security", DepartmentStatus.ACTIVE));
        Employee employee = employees.saveAndFlush(new Employee("Alex Tan", "alex.tan@example.com", department,
                "Security Engineer", EmployeeStatus.ACTIVE, LocalDate.of(2024, 1, 15)));

        assertNotNull(employee.getId());
        assertTrue(employees.existsByEmailIgnoreCase("ALEX.TAN@EXAMPLE.COM"));
    }
}
