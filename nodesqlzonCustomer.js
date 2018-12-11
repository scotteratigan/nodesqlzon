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
let productArray = [];

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
	console.log('*** Welcome to NodeSQLzon! ***');
    connection.query(query, function(err, res, fields) {  
        if (err) throw err;
		else if (res.length > 0) {
			res.forEach((product) => productArray.push(product) );
			console.log('got products...');
			var productTable = new Table;
			productArray.forEach( (product) => {
				productTable.cell('Id', product.id, Table.number(0));
				productTable.cell('Description', product.product_name);
				productTable.cell('Price, $', product.price, Table.number(2));
				productTable.newRow();
			});
			console.log(productTable.toString());
			promptToBuyProduct();
		}
        else console.log('Sold out of all items! Please come back soon.');
	});
	disconnectDB();
}

function promptToBuyProduct() {
	inquirer.prompt([{
		name: 'id',
		type: 'input',
		message: 'Which product would you like to buy?',
		validate: (itemId) => {
			return (!isNaN(itemId) && itemId > 0 && itemId <= productArray.length); // todo: ensure number is in range.
		}
	}]).then( (purchase) => {
		//console.log('Purchasing', purchase.id);
		const itemToPurchase = productArray[purchase.id - 1].product_name;
		const maxQuantity = parseInt(productArray[purchase.id - 1].stock_quantity);
		const price = parseFloat(productArray[purchase.id - 1].price).toFixed(2);
		//console.log('buying', itemToPurchase, 'max is', maxQuantity);
		inquirer.prompt([{
			name: 'quantity',
			type: 'input',
			message: 'How many would you like to buy',
			validate: (quantity) => {
				return (!isNaN(quantity) && quantity > 0 && quantity <= maxQuantity); // todo: ensure number is in range.
			}
		}]).then( (purchase) => {
			const salesTotal = parseInt(purchase.quantity) * price;
			console.log(`Ok, purchasing ${purchase.quantity} of ${itemToPurchase} for $ ${salesTotal}.`);
		});
	});
}

function numWholeDigits(x) {
	return (Math.log10((x ^ (x >> 31)) - (x >> 31)) | 0) + 1;
  }