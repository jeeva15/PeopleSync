package com.peoplesync.employee.repository;

import com.peoplesync.employee.model.Department;
import com.peoplesync.employee.model.DepartmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DepartmentRepository extends JpaRepository<Department, Long> {
    List<Department> findAllByOrderByNameAsc();
    List<Department> findByStatusOrderByNameAsc(DepartmentStatus status);
}
