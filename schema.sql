DROP DATABASE IF EXISTS employee_tracker_db;
CREATE DATABASE employee_tracker_db;

USE employee_tracker_db;

DROP TABLE IF EXISTS departments;
CREATE TABLE departments (
  id INT NOT NULL,
  depname VARCHAR(30) NOT NULL
);

DROP TABLE IF EXISTS employee_role;
CREATE TABLE employee_role (
  id INT NOT NULL,
  title VARCHAR(30) NOT NULL,
  salary DECIMAL,
  department_id INT NOT NULL
);

DROP TABLE IF EXISTS employee;
CREATE TABLE employee (
  id INT NOT NULL,
  first_name VARCHAR(30) NOT NULL,
  last_name VARCHAR(30) NOT NULL,
  role_id INT NOT NULL,
  manager_id INT
);

