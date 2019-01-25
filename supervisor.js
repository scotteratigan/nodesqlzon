const mysql = require('mysql');
const inquirer = require('inquirer');
const Table = require('easy-table');
let salesArray = [];
let departmentSalesTotal = [];

const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "hunter2!",
    database: "bamazon"
});

promptSupervisorFunction();

async function promptSupervisorFunction() {
	let SupervisorChoice = await inquirer.prompt([{
		name: 'action',
		type: 'list',
		message: 'What would you like to do?',
		choices: ['View Product Sales by Department', 'Create New Department', 'Quit']
	}]);
	//console.clear();
	await performSelectedAction(SupervisorChoice.action);
	
}

async function performSelectedAction(SupervisorFunction) {
	switch (SupervisorFunction) {
		case 'View Product Sales by Department':
			await displayProfits().catch((err) => console.error(err));
			break;
        case 'Create New Department':
            await promptNewDeptName();
            // await console.log('Not implemented yet...');
            break;
        case 'Quit':
            await connection.end();
            process.exit(0);
            break;
		default:
			console.error('Should never get here...');
			break;
	};
	promptSupervisorFunction();
}

async function displayProfits() {
	return new Promise(async (resolve, reject) => {
        queryString = 'SELECT products.sales_total, products.department_name, departments.overhead_costs FROM departments INNER JOIN products ON departments.department_name=products.department_name;';
		let res = await getProductsFromDB(queryString).catch((err) => {console.error(err)});
		salesArray = []; // wipe out any old data;
        //res.forEach((sale) => salesArray.push(sale) );
        res.forEach( (sale) => {
            let deparmentAlreadyExists = false;
            for (let i = 0; i < departmentSalesTotal.length; i++) {
                if (departmentSalesTotal[i].department_name === sale.department_name) {
                    deparmentAlreadyExists = true;
                    departmentSalesTotal[i].sales_total += sale.sales_total;
                }
            }
            if (!deparmentAlreadyExists) {
                departmentSalesTotal.push(sale);
            }
        });
        //console.log(departmentSalesTotal); // ok, working but I need to incorporate the overhead into the calculation...
		// console.clear();
        var profitsTable = new Table;
		departmentSalesTotal.forEach( (department) => {
		    //profitsTable.cell('Id', department.id, Table.number(0));
			profitsTable.cell('Department', department.department_name);
            profitsTable.cell('Total Sales', department.sales_total, Table.number(2));
            profitsTable.cell('Overhead', department.overhead_costs, Table.number(2));
            profitsTable.cell('Profit', department.sales_total - department.overhead_costs, Table.number(2));
			profitsTable.newRow();
		});
		await console.log(profitsTable.toString());
		return resolve();
	});
}

function getProductsFromDB(queryString) {
	return new Promise( (resolve, reject) => {
		connection.query(queryString, function(err, res, fields) {
			//connection.end();
			if (err) throw err;
			else if (res.length > 0) {
				return resolve(res);
			}
			else return reject([]);
		});
	});
}

async function promptNewDeptName() {
    return new Promise( (resolve, reject) => {
        let newDept = await inquirer.prompt([{
            name: 'deptName',
            type: 'input',
            message: 'What is the name of the department?'
        }]);
    });
    // todo: finish writing this?
}