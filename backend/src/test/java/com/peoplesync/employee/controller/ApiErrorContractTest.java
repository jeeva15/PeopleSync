package com.peoplesync.employee.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.peoplesync.employee.dto.EmployeeRequest;
import com.peoplesync.employee.error.*;
import com.peoplesync.employee.model.EmployeeStatus;
import com.peoplesync.employee.service.DepartmentService;
import com.peoplesync.employee.service.EmployeeService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.system.CapturedOutput;
import org.springframework.boot.test.system.OutputCaptureExtension;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;

import static org.hamcrest.Matchers.hasItems;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(
        value = {EmployeeController.class, DepartmentController.class},
        properties = "logging.level.org.springframework.web.servlet.mvc.method.annotation.ExceptionHandlerExceptionResolver=INFO")
@Import(GlobalExceptionHandler.class)
@ExtendWith(OutputCaptureExtension.class)
class ApiErrorContractTest {
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper objectMapper;
    @MockitoBean EmployeeService employeeService;
    @MockitoBean DepartmentService departmentService;

    @Test
    void invalidRequestReturnsFieldLevelValidationErrors() throws Exception {
        var invalid = new EmployeeRequest(" ", "invalid-email", null, " ", null, null);

        mvc.perform(post("/api/v1/employees")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsBytes(invalid)))
                .andExpect(status().isBadRequest())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.timestamp").isNotEmpty())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.code").value("VALIDATION_FAILED"))
                .andExpect(jsonPath("$.message").value("Request validation failed"))
                .andExpect(jsonPath("$.path").value("/api/v1/employees"))
                .andExpect(jsonPath("$.errors").isArray())
                .andExpect(jsonPath("$.errors[*].field",
                        hasItems("fullName", "email", "departmentId", "jobTitle", "status", "joiningDate")))
                .andExpect(jsonPath("$.errors[?(@.field == 'email')].message").isNotEmpty());
    }

    @Test
    void missingEmployeeReturnsNotFoundContract() throws Exception {
        when(employeeService.findById(404L)).thenThrow(new ResourceNotFoundException("Employee not found"));

        mvc.perform(get("/api/v1/employees/404"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.code").value("RESOURCE_NOT_FOUND"))
                .andExpect(jsonPath("$.message").value("Employee not found"))
                .andExpect(jsonPath("$.path").value("/api/v1/employees/404"))
                .andExpect(jsonPath("$.errors").isEmpty());
    }

    @Test
    void missingDepartmentReturnsNotFoundContract() throws Exception {
        when(departmentService.findById(404L)).thenThrow(new ResourceNotFoundException("Department not found"));

        mvc.perform(get("/api/v1/departments/404"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.code").value("RESOURCE_NOT_FOUND"))
                .andExpect(jsonPath("$.message").value("Department not found"))
                .andExpect(jsonPath("$.path").value("/api/v1/departments/404"))
                .andExpect(jsonPath("$.errors").isEmpty());
    }

    @Test
    void duplicateEmailReturnsClearConflictContract() throws Exception {
        when(employeeService.create(any(EmployeeRequest.class)))
                .thenThrow(new ConflictException("An employee with this email already exists"));

        mvc.perform(validCreateRequest())
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409))
                .andExpect(jsonPath("$.code").value("CONFLICT"))
                .andExpect(jsonPath("$.message").value("An employee with this email already exists"))
                .andExpect(jsonPath("$.path").value("/api/v1/employees"))
                .andExpect(jsonPath("$.errors").isEmpty());
    }

    @Test
    void inactiveDepartmentAssignmentReturnsMeaningfulBusinessError() throws Exception {
        when(employeeService.create(any(EmployeeRequest.class)))
                .thenThrow(new BusinessRuleException("Employees can only be assigned to an active department"));

        mvc.perform(validCreateRequest())
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.code").value("BUSINESS_RULE_VIOLATION"))
                .andExpect(jsonPath("$.message").value("Employees can only be assigned to an active department"))
                .andExpect(jsonPath("$.errors").isEmpty());
    }

    @Test
    void unexpectedErrorIsGenericAndLoggedWithoutSensitiveExceptionMessage(CapturedOutput output) throws Exception {
        when(employeeService.findById(7L))
                .thenThrow(new IllegalStateException("database-password=must-not-leak"));

        mvc.perform(get("/api/v1/employees/7"))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.status").value(500))
                .andExpect(jsonPath("$.code").value("INTERNAL_ERROR"))
                .andExpect(jsonPath("$.message").value("An unexpected error occurred"))
                .andExpect(jsonPath("$.path").value("/api/v1/employees/7"))
                .andExpect(jsonPath("$.errors").isEmpty())
                .andExpect(jsonPath("$.stackTrace").doesNotExist())
                .andExpect(jsonPath("$.exception").doesNotExist());

        assertTrue(output.getOut().contains("Unhandled request failure path=/api/v1/employees/7"));
        assertTrue(output.getOut().contains("exceptionType=IllegalStateException"));
        assertFalse(output.getAll().contains("database-password=must-not-leak"));
    }

    private org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder validCreateRequest()
            throws Exception {
        var request = new EmployeeRequest(
                "Aisha Tan",
                "aisha.contract@example.com",
                1L,
                "Engineer",
                EmployeeStatus.ACTIVE,
                LocalDate.of(2024, 1, 15));
        return post("/api/v1/employees")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsBytes(request));
    }
}
