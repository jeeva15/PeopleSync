package com.peoplesync.employee.controller;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.peoplesync.employee.dto.DepartmentResponse;
import com.peoplesync.employee.model.DepartmentStatus;
import com.peoplesync.employee.service.DepartmentService;

@WebMvcTest(DepartmentController.class)
class DepartmentControllerTest {
    @Autowired MockMvc mvc;
    @MockitoBean DepartmentService service;

    @Test void returnsActiveDepartmentsFromService() throws Exception {
        when(service.findAll(true)).thenReturn(List.of(
                new DepartmentResponse(1L, "Engineering", DepartmentStatus.ACTIVE, null, null)));

        mvc.perform(get("/api/v1/departments").param("activeOnly", "true"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Engineering"))
                .andExpect(jsonPath("$[0].status").value("ACTIVE"));
    }
}
