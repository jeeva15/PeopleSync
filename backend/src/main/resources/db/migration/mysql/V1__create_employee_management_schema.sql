CREATE TABLE departments (
    id BIGINT NOT NULL AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT pk_departments PRIMARY KEY (id),
    CONSTRAINT uk_departments_name UNIQUE (name),
    CONSTRAINT ck_departments_status CHECK (status IN ('ACTIVE', 'INACTIVE'))
);

CREATE INDEX idx_departments_status ON departments (status);

CREATE TABLE employees (
    id BIGINT NOT NULL AUTO_INCREMENT,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(254) NOT NULL,
    department_id BIGINT NOT NULL,
    job_title VARCHAR(100) NOT NULL,
    status VARCHAR(30) NOT NULL,
    joining_date DATE NOT NULL,
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT pk_employees PRIMARY KEY (id),
    CONSTRAINT uk_employees_email UNIQUE (email),
    CONSTRAINT ck_employees_email_lowercase CHECK (email = LOWER(email)),
    CONSTRAINT fk_employees_department FOREIGN KEY (department_id) REFERENCES departments (id) ON DELETE RESTRICT,
    CONSTRAINT ck_employees_status CHECK (status IN ('ACTIVE', 'INACTIVE'))
);

CREATE INDEX idx_employees_department ON employees (department_id);
CREATE INDEX idx_employees_status ON employees (status);
CREATE INDEX idx_employees_joining_date ON employees (joining_date);
CREATE INDEX idx_employees_full_name ON employees (full_name);
