//Required dependancies
require('dotenv').config()
colors = require('colors');
const Table = require('cli-table'),
    keys = require("./keys.js"),
    inquirer = require("inquirer");

// mysql connection with login information contained in dotenv and keys
let mysql = require('mysql'),
    connection = mysql.createConnection({
        host: 'localhost',
        port: 3306,
        user: keys.user,
        password: keys.password,
        database: 'bamazon'
    })

// Check for successful connection to database
connection.connect(function (err) {
    if (err) throw err;
    welcomeDisplay();
    managerMenu();
});

// Display all items for sale in a table
function listProducts() {
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;
        let table = new Table({
            head: ['ID'.underline.magenta, 'Name'.underline.yellow, 'Department'.underline.cyan, 'Price'.underline.green, 'Stock'.underline.red]
        })
        for (let i = 0; i < res.length; i++) {
            table.push([res[i].item_id, res[i].product_name, res[i].department_name, `$${res[i].price}`, res[i].stock_quantity]);
        };
        console.log("\n")
        console.log(table.toString());
    });
};

// Push all unique department names to an array for selector
var deptArray = [];

//Prompts user to choose an exisiting department to add product to 
function deptChoices() {
    connection.query(
        "SELECT DISTINCT department_name FROM departments",
        function (err, res) {
            if (err) throw err;
            for (let i = 0; i < res.length; i++) {
                deptArray.push(res[i].department_name);
            };
        }
    );
}

//Fills up deptArray upon application start
deptChoices();

// Welcome view for BAMAZON
function welcomeDisplay() {
    console.log("*******************************************************************".rainbow);
    console.log("                Welcome to Bamazon Manager View                    ".bgRed);
    console.log("*******************************************************************\n".rainbow);
}

// Exit view for BAMAZON
function exitDisplay() {
    console.log("*******************************************************************".rainbow);
    console.log("               Now Exiting Bamazon Manager View                    ".bgBlue);
    console.log("*******************************************************************\n".rainbow);
}

//Prompt user with choices for all features of manager view
function managerMenu() {
    inquirer.prompt({
        type: 'list',
        name: 'action',
        message: 'Choose an action',
        choices: [{
                name: 'View Products for Sale',
                value: "sale"
            },
            {
                name: 'View Low Inventory',
                value: "low"
            },
            {
                name: 'Add to Inventory',
                value: "add"
            },
            {
                name: 'Add New Product',
                value: "new"
            },
            {
                name: '[Exit Manager View]',
                value: process.exit
            }
        ]
    }).then(function (answers) {
        // Switch case based on response from prompt
        switch (answers.action) {
            case "sale":
                listProducts();
                confirmRestart();
                break;
            case "low":
                viewLow();
                break;
            case "add":
                addInventory();
                break;
            case "new":
                createItem();
                break;
            default:
                process.exit(exitDisplay());
        }
    })
}

// Display all items with 5 or less items
function viewLow() {
    let table = new Table({
        head: ['ID'.underline.magenta, 'Name'.underline.yellow, 'Department'.underline.cyan, 'Price'.underline.green, 'Stock'.underline.red]
    })
    connection.query(
        `SELECT * 
            FROM products 
            WHERE stock_quantity <= 5`,
        (function (err, res) {
            if (err) throw err
            for (let i = 0; i < res.length; i++) {
                table.push([res[i].item_id, res[i].product_name, res[i].department_name, `$${res[i].price}`, res[i].stock_quantity]);
            };
            console.log("\n")
            console.log(table.toString());
            confirmRestart();
        })
    )
}

// Create a new product and add to table
function createItem() {

    console.log("Adding a new item...\n");
    inquirer.prompt([{
            type: "input",
            name: "product",
            message: "Name of product?",
        },
        {
            type: "list",
            name: "dept",
            message: 'Select a department',
            choices: deptArray
        },
        {
            type: "input",
            name: "price",
            message: "Price of product?"
        },
        {
            type: "input",
            name: "quantity",
            message: "Quantity of product available?"
        }
    ]).then(function (item) {
        var query = connection.query(
            "INSERT INTO products SET ?", {
                product_name: item.product,
                department_name: item.dept,
                price: item.price,
                stock_quantity: item.quantity
            },
            function (err, res) {
                if (err) throw err;
                console.log(res.affectedRows + " item added!\n");
                confirmRestart();
            });
    })
}

// Add to exisiting stock
function addInventory() {
    listProducts();
    console.log("Restocking items...\n");
    inquirer.prompt([{
            type: "input",
            name: "id",
            message: "ID of item you want to restock",
        },
        {
            type: "input",
            name: "quantity",
            message: "Quantity to add?"
        }
    ]).then(function (answer) {
        var query = connection.query("UPDATE products SET stock_quantity = stock_quantity + ? WHERE item_id = ?", [answer.quantity, answer.id], function (err, res) {
            if (err) throw err;
            console.log("\nInventory updated!".bold.blue);
        });

        confirmRestart();
    })
}

// Gives user the option to continue or exit application after each function is complete
function confirmRestart() {
    inquirer.prompt({
            type: "confirm",
            message: "Would you like to continue?".bold.yellow,
            name: "choice"
        })
        .then(function (answer) {
            if (answer.choice) managerMenu();
            else {
                process.exit(exitDisplay());
            }
        });
}