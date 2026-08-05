INSERT INTO departments (name, status) VALUES
    ('Engineering', 'ACTIVE'),
    ('Human Resources', 'ACTIVE'),
    ('Finance', 'ACTIVE'),
    ('Operations', 'ACTIVE'),
    ('Legacy Services', 'INACTIVE');


INSERT INTO employees (full_name, email, department_id, job_title, status, joining_date) VALUES
('Aisha Tan', 'aisha.tan@example.com', 1, 'Software Engineer', 'ACTIVE', '2023-04-17'),
('Daniel Lim', 'daniel.lim@example.com', 2, 'Financial Analyst', 'ACTIVE', '2022-09-05'),
('Mei Wong', 'mei.wong@example.com', 3, 'HR Business Partner', 'ACTIVE', '2021-01-11'),
('Ravi Kumar', 'ravi.kumar@example.com', 1, 'Senior Engineer', 'INACTIVE', '2020-06-22');

