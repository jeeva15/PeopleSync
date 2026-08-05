package com.peoplesync.employee.repository;

import com.peoplesync.employee.model.Employee;
import com.peoplesync.employee.model.EmployeeStatus;
import org.springframework.data.jpa.domain.Specification;

public final class EmployeeSpecifications {
    private EmployeeSpecifications() {}

    public static Specification<Employee> matches(String search, Long departmentId, EmployeeStatus status) {
        return Specification.allOf(searchContains(search), hasDepartment(departmentId), hasStatus(status));
    }

    private static Specification<Employee> searchContains(String search) {
        return (root, query, cb) -> {
            if (search == null || search.isBlank()) return cb.conjunction();
            String pattern = "%" + escapeLike(search.toLowerCase()) + "%";
            return cb.or(
                    cb.like(cb.lower(root.get("fullName")), pattern, '\\'),
                    cb.like(cb.lower(root.get("email")), pattern, '\\'));
        };
    }

    private static Specification<Employee> hasDepartment(Long id) {
        return (root, query, cb) -> id == null ? cb.conjunction() : cb.equal(root.get("department").get("id"), id);
    }

    private static Specification<Employee> hasStatus(EmployeeStatus status) {
        return (root, query, cb) -> status == null ? cb.conjunction() : cb.equal(root.get("status"), status);
    }

    private static String escapeLike(String value) {
        return value.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_");
    }
}
