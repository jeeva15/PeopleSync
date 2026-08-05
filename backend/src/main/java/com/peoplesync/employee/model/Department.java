package com.peoplesync.employee.model;

import jakarta.persistence.*;

@Entity
@Table(name = "departments", uniqueConstraints = @UniqueConstraint(name = "uk_departments_name", columnNames = "name"),
        indexes = @Index(name = "idx_departments_status", columnList = "status"))
public class Department extends AuditableEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private DepartmentStatus status;

    protected Department() {}

    public Department(String name, DepartmentStatus status) {
        this.name = name;
        this.status = status;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public DepartmentStatus getStatus() { return status; }
}
