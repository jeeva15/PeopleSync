package com.peoplesync.employee.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.peoplesync.employee.dto.EmployeeRequest;
import com.peoplesync.employee.error.GlobalExceptionHandler;
import com.peoplesync.employee.model.EmployeeStatus;
import com.peoplesync.employee.service.EmployeeService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.Sort;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import java.time.LocalDate;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(EmployeeController.class)
@Import(GlobalExceptionHandler.class)
class EmployeeControllerTest {
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper objectMapper;
    @MockitoBean EmployeeService service;

    @Test void returnsConsistentValidationError() throws Exception {
        var invalid = new EmployeeRequest(" ", "not-an-email", null, "Engineer", EmployeeStatus.ACTIVE, LocalDate.now());

        mvc.perform(post("/api/v1/employees").contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsBytes(invalid)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_FAILED"))
                .andExpect(jsonPath("$.errors").isArray());
    }

    @Test void acceptsLowercaseSortDirectionFromApiContract() throws Exception {
        mvc.perform(get("/api/v1/employees")
                        .param("page", "1")
                        .param("pageSize", "20")
                        .param("sort", "joiningDate")
                        .param("direction", "desc"))
                .andExpect(status().isOk());

        verify(service).findAll(eq(1), eq(20), isNull(), isNull(), isNull(),
                eq("joiningDate"), eq(Sort.Direction.DESC));
    }

    @Test void rejectsUnsupportedSortDirection() throws Exception {
        mvc.perform(get("/api/v1/employees").param("direction", "sideways"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_FAILED"));
    }
}
