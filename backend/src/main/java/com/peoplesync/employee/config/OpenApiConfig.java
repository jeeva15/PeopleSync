package com.peoplesync.employee.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {
    @Bean
    OpenAPI employeeManagementOpenApi() {
        return new OpenAPI().info(new Info()
                .title("Employee Management API")
                .version("v1")
                .description("Employee and department management endpoints."));
    }
}
