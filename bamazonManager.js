require('dotenv').config()
colors = require('colors');

const Table = require('cli-table'),
    keys = require("./keys.js"),
    inquirer = require("inquirer");

let mysql = require('mysql'),
    connection = mysql.createConnection({
        host: 'localhost',
        port: 3306,
        user: keys.user,
        password: keys.password,
        database: 'bamazon'
    })

connection.connect(function (err) {
    if (err) throw err;
    welcomeDisplay();
    managerMenu();
});

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
        // process.exit();
    });
};

var deptArray = [];

function deptChoices() {
    connection.query(
        "SELECT DISTINCT department_name FROM products",
        function (err, res) {
            if (err) throw err;
            for (let i = 0; i < res.length; i++) {
                deptArray.push(res[i].department_name);
            };
        }
    );
}
deptChoices();

function welcomeDisplay() {
    console.log("*******************************************************************".rainbow);
    console.log("                Welcome to Bamazon Manager View                    ".bgRed);
    console.log("*******************************************************************\n".rainbow);
}

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
        switch (answers.action) {
            case "sale":
                listProducts();
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
                process.exit();
        }
    })
}

function viewLow() {
    let table = new Table({
        head: ['ID'.underline.magenta, 'Name'.underline.yellow, 'Department'.underline.cyan, 'Price'.underline.green, 'Stock'.underline.red]
    })
    connection.query(
        `SELECT * 
            FROM products 
            WHERE stock_quantity < 5`,
        (function (err, res) {
            if (err) throw err
            for (let i = 0; i < res.length; i++) {
                table.push([res[i].item_id, res[i].product_name, res[i].department_name, `$${res[i].price}`, res[i].stock_quantity]);
            };
            console.log("\n")
            console.log(table.toString());
            process.exit();
        })
    )
}

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
            });

        console.log(query.sql);
        process.exit();
    })
}

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
    ]).then(function (item) {
        var query = connection.query("UPDATE products SET stock_quantity = stock_quantity + ? WHERE item_id = ?",
            [
            JSON.parse(item.quantity),
            JSON.parse(item.id)
            ],
            function (err, res) {
                if (err) throw err;
                console.log(res.affectedRows + " inventory updated!\n");
            });
        console.log(query.sql);
        listProducts();
        process.exit();
    })
}