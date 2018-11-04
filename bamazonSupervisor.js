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
    supervisorMenu();
});

// Welcome view for BAMAZON
function welcomeDisplay() {
    console.log("*******************************************************************".rainbow);
    console.log("              Welcome to Bamazon Supervisor View                   ".bgRed);
    console.log("*******************************************************************\n".rainbow);
}

// Exit view for BAMAZON
function exitDisplay() {
    console.log("*******************************************************************".rainbow);
    console.log("             Now Exiting Bamazon Supervisor View                   ".bgBlue);
    console.log("*******************************************************************\n".rainbow);
}

//Prompt user with choices for all features of supervisor view
function supervisorMenu() {
    inquirer.prompt({
        type: 'list',
        name: 'action',
        message: 'Choose an action',
        choices: [{
                name: 'View Product Sales by Department',
                value: "sale"
            },
            {
                name: 'Create New Department',
                value: "new"
            },
            {
                name: '[Exit Supervisor View]',
                value: process.exit
            }
        ]
    }).then(function (answers) {
        // Switch case based on response from prompt
        switch (answers.action) {
            case "sale":
                viewSales();
                break;
            case "new":
                createDepartment();
                break;
            default:
                process.exit(exitDisplay());
        }
    })
}

// Prompt to create new department
function createDepartment() {
    console.log("Creating new department...\n");
    inquirer.prompt([{
            type: "input",
            name: "name",
            message: "Name of Department?",
        },
        {
            type: "input",
            name: "overhead",
            message: "Overhead costs?"
        },
    ]).then(function (item) {
        var query = connection.query(
            "INSERT INTO departments SET ?", {
                department_name: item.name,
                over_head_costs: item.overhead,
            },
            function (err, res) {
                if (err) throw err;
                console.log("\nNew department added!".blue.bold);
            });

        confirmRestart();
    })
}

//Join tables to calculate total profit
function viewSales() {
    let table = new Table({
        head: ['Department'.underline.cyan, 'Overhead Cost'.underline.green, 'Product Sales'.underline.yellow, 'Total Profit'.underline.red]
    })
    let query = connection.query(`SELECT departments.department_name, departments.over_head_costs, ` +
        `SUM(products.product_sales) AS product_sales, ` +
        `SUM(products.product_sales) - departments.over_head_costs AS total_profit ` +
        `FROM departments LEFT JOIN products ON departments.department_name = products.department_name ` +
        `GROUP BY departments.department_name;`,
        (function (err, res) {
            if (err) throw err
            for (let i = 0; i < res.length; i++) {
                table.push([res[i].department_name, `$${res[i].over_head_costs}`, `$${res[i].product_sales}`, `$${res[i].total_profit}`]);
            };
            console.log("\n")
            console.log(table.toString());
            confirmRestart();
        })
    )
}

// Gives user the option to continue or exit application after each function is complete
function confirmRestart() {
    inquirer.prompt({
            type: "confirm",
            message: "Would you like to continue?".bold.yellow,
            name: "choice"
        })
        .then(function (answer) {
            if (answer.choice) supervisorMenu();
            else {
                process.exit(exitDisplay());
            }
        });
}