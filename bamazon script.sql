CREATE DATABASE bamazon;

USE bamazon;

CREATE TABLE products (
    item_id INTEGER AUTO_INCREMENT PRIMARY KEY,
    product_name VARCHAR(50) NOT NULL,
    department_name VARCHAR(50) NOT NULL,
    price INTEGER(10),
    stock_quantity INTEGER(10)
);

INSERT INTO products (
product_name,
department_name,
price,
stock_quantity)
VALUES(
'Hi-Potion',
'Consumable',
7.50,
75);

CREATE TABLE departments(
    department_id INTEGER AUTO_INCREMENT PRIMARY KEY,
    department_name VARCHAR(50) NOT NULL,
    over_head_costs INTEGER(10),
    product_sales INTEGER(10),
    total_profit INTEGER(10)
);

INSERT INTO departments (
department_name,
over_head_costs,
product_sales,
total_profit)
VALUES(
'Consumable',
3.50,
0,
0);

SELECT * FROM products;
SELECT * FROM departments;