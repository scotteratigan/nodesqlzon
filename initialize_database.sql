DROP DATABASE IF EXISTS bamazon;
CREATE DATABASE bamazon;
USE bamazon;

ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'password';

CREATE TABLE products (
  id INT AUTO_INCREMENT,
  product_name VARCHAR(100) NOT NULL,
  department_name VARCHAR(50) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  stock_quantity INT NOT NULL,
  sold_quantity INT NOT NULL,
  sales_total DECIMAL(10,2) NOT NULL,
  PRIMARY KEY (id)
);

INSERT INTO products (product_name, department_name, price, stock_quantity, sold_quantity, sales_total) VALUES
("JavaScript and Let's Encrypt", "full stack", 24.99, 100, 1, 24.99),
("LETs Learn JavaScript ECMA6", "full stack", 130.25, 3, 3, 11.45),
("CSS with Style - A Deluge of Info", "front end", 30.25, 27, 11, 234.33),
("jQuery in a Hurry w/ Guest Bill Murray", "front end", 10.00, 4, 15, 15.88),
("HTML5 Comes Alive (Semantics)", "front end", 15.15, 38, 5, 19.99),
("NodeJS Basic Nodules Class", "back end", 52.99, 11, 6, 10.00),
("Finally - An Await/Async Class ('It's great, I promise!')", "full stack", 75.75, 22, 11, 0.00),
("Lazy Loading for Idle Individuals", "front end", 5.25, 53, 0, 56.87),
("SEO Optimization for Search Engines Class", "front end", 23.12, 47, 18, 56.00),
("Angular From a New Angle Class (Barebone Basics)", "full stack", 99.99, 10, 1, 12.00);

/*UPDATE products SET stock_quantity = 5 where id = 2;

--select * from products;

UPDATE products SET `stock_quantity` = '99' WHERE `id` = '1'*/

CREATE TABLE departments (
  id INT AUTO_INCREMENT,
  department_name VARCHAR(50) NOT NULL,
  overhead_costs DECIMAL(10,2) NOT NULL,
  PRIMARY KEY (id)
);

INSERT INTO departments (department_name, overhead_costs) VALUES
("back end", 150.45),
("front end", 375.44),
("full stack", 234.99);

/*SELECT products.sales_total, products.department_name FROM departments
INNER JOIN products ON departments.department_name=products.department_name;*/

select * from departments;

select * from products;