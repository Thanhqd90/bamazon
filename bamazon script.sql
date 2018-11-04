DROP DATABASE IF EXISTS bamazon;
CREATE DATABASE bamazon;

USE bamazon;

CREATE TABLE products (
    item_id INTEGER AUTO_INCREMENT PRIMARY KEY,
    product_name VARCHAR(50) NOT NULL,
    department_name VARCHAR(50) NOT NULL,
    price DECIMAL(10,2),
    stock_quantity INTEGER(10),
    product_sales DECIMAL(10,2) NOT NULL DEFAULT '0.00'
);

INSERT INTO products (
product_name,
department_name,
price,
stock_quantity)
VALUES(
'Potion',
'Consumable',
3.00,
10);

CREATE TABLE departments(
    department_id INTEGER AUTO_INCREMENT PRIMARY KEY,
    department_name VARCHAR(50) NOT NULL,
    over_head_costs DECIMAL(10,2)
);

UPDATE departments SET over_head_costs = 5000 WHERE department_id = 1;

INSERT INTO departments (
department_name,
over_head_costs)
VALUES(
'Consumable',
2.50);

SELECT * FROM products;
SELECT * FROM departments;