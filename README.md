# bamazon
Week 12 HW - node.js &amp; mySQL 

Video demo link: https://www.youtube.com/watch?v=HeIMpUC0ICQ&feature=youtu.be

Instructions
Clone repository to your local machine
run "npm install" in your command line to install all dependancies
run bamazon script.schema on your mysql application of choice to create the database

Customer View
run "node bamazonCustomer.js" 
User will enter the ID of the product they would like to purchase and then enter the quantity of the item to purchase.  Application will display feedback based on purchase amount and available stock.

Manager View 
run "node bamazonManager.js" 
User will be prompted with the follow commands 

View products for sale: Display all items for sale
View low inventory: Display all items with a quantity of 5 or less
Add to inventory: User will select a product id and amount to add to exisiting stock
Add new product: User will input product information to add to products for sale

Supervisor View 
run "node bamazonSupervisor.js" 
User will be prompted with the follow commands 

View product sales by department: Displays department name, overhead cost, product sales and total profit.  Information is gathered by joining the products and departments table from mysql data base
Add new department: User will input department information to add to departments table.
