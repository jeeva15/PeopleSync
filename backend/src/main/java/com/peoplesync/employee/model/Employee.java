package com.peoplesync.employee.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "employees", uniqueConstraints = @UniqueConstraint(name = "uk_employees_email", columnNames = "email"),
        indexes = {
                @Index(name = "idx_employees_department", columnList = "department_id"),
                @Index(name = "idx_employees_status", columnList = "status"),
                @Index(name = "idx_employees_joining_date", columnList = "joining_date"),
                @Index(name = "idx_employees_full_name", columnList = "full_name")
        })
public class Employee extends AuditableEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "full_name", nullable = false, length = 150)
    private String fullName;

    @Column(nullable = false, length = 254)
    private String email;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "department_id", nullable = false, foreignKey = @ForeignKey(name = "fk_employees_department"))
    private Department department;

    @Column(name = "job_title", nullable = false, length = 100)
    private String jobTitle;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private EmployeeStatus status;

    @Column(name = "joining_date", nullable = false)
    private LocalDate joiningDate;

    protected Employee() {}

    public Employee(String fullName, String email, Department department, String jobTitle,
                    EmployeeStatus status, LocalDate joiningDate) {
        update(fullName, email, department, jobTitle, status, joiningDate);
    }

    public void update(String fullName, String email, Department department, String jobTitle,
                       EmployeeStatus status, LocalDate joiningDate) {
        this.fullName = fullName;
        this.email = email;
        this.department = department;
        this.jobTitle = jobTitle;
        this.status = status;
        this.joiningDate = joiningDate;
    }

    public void deactivate() { this.status = EmployeeStatus.INACTIVE; }
    public Long getId() { return id; }
    public String getFullName() { return fullName; }
    public String getEmail() { return email; }
    public Department getDepartment() { return department; }
    public String getJobTitle() { return jobTitle; }
    public EmployeeStatus getStatus() { return status; }
    public LocalDate getJoiningDate() { return joiningDate; }
}
