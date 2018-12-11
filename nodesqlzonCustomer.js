const mysql = require('mysql');
const inquirer = require('inquirer');
const Table = require('easy-table');

const query = 'SELECT * FROM products';
const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "hunter2!",
    database: "bamazon"
});
const currencyDollarFormatter = new Intl.NumberFormat('en-US', {
	style: 'currency',
	currency: 'USD',
	minimumFractionDigits: 2
  });
let productList = [];

displayProducts();

function connectToDB() {
    connection.connect(function(err) {
        if (err) throw err;
		//console.log("connected as id " + connection.threadId);
    });
}

function disconnectDB() {
	connection.end();
}

function displayProducts() {
	connectToDB();
	let productArray = [];
	console.log('*** Welcome to NodeSQLzon! ***');
    connection.query(query, function(err, res, fields) {  
        if (err) throw err;
		else if (res.length > 0) {
			res.forEach((product) => productArray.push(product) );
			console.log('got products...');
			var productTable = new Table;
			productArray.forEach( (product) => {
				productTable.cell('Product Id', product.id);
				productTable.cell('Description', product.product_name);
				productTable.cell('Price, $', product.price, Table.number(2));
				productTable.newRow();
			});
			console.log(productTable.toString());
		}
        else console.log('Sold out of all items! Please come back soon.');
	});
	disconnectDB();
}

async function buyProduct() {
	inquirer.prompt([{
		name: 'dbAction',
		type: 'list',
		choices: [],
		message: 'What action would you like to perform?'
	}]).then(answers => {
		if (answers.dbAction === 'Search by Artist') {
			searchArtist();
		}
		else if (answers.dbAction === 'Search by Song') {
			searchSong();
		}
		else if (answers.dbAction === 'Artists that appear more than once') {
			searchMultiHits();
		}
		else if (answers.dbAction === 'Search all data in range') {
			searchRange();
		}
	});
}

function numWholeDigits(x) {
	return (Math.log10((x ^ (x >> 31)) - (x >> 31)) | 0) + 1;
  }