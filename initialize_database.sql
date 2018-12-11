DROP DATABASE IF EXISTS bamazon;
CREATE DATABASE bamazon;
USE bamazon;

ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'hunter2!';

CREATE TABLE products (
  id INT NOT NULL AUTO_INCREMENT,
  product_name VARCHAR(100) NOT NULL,
  department_name VARCHAR(50) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  stock_quantity INT NOT NULL,
  PRIMARY KEY (id)
);

INSERT INTO products (product_name, department_name, price, stock_quantity) VALUES
("JavaScript and Let's Encrypt", "full stack", 24.99, 100),
("LETs Learn JavaScript ECMA6", "full stack", 130.25, 50),
("CSS with Style - A Deluge of Info", "front end", 30.25, 27),
("jQuery in a Hurry w/ Guest Bill Murray", "front end", 10.00, 10),
("HTML5 Comes Alive (Semantics)", "front end", 15.15, 38),
("NodeJS Basic Nodules Class", "back end", 52.99, 11),
("Finally - An Await/Async Class ('It's great, I promise!')", "full stack", 75.75, 22),
("Lazy Loading for Idle Individuals", "front end", 5.25, 53),
("SEO Optimization for Search Engines Class", "front end", 23.12, 47),
("Angular From a New Angle Class (Barebone Basics)", "full stack", 99.99, 10);

select * from products;