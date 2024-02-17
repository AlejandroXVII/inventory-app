#! /usr/bin/env node

console.log(
	'This script populates some test books, authors, genres and bookinstances to your database. Specified database as argument - e.g.: node populatedb "mongodb+srv://cooluser:coolpassword@cluster0.lz91hw2.mongodb.net/local_library?retryWrites=true&w=majority"'
);

// Get arguments passed on command line
const userArgs = process.argv.slice(2);

const Category = require("./models/category");
const Item = require("./models/item");

const categories = [];
const items = [];

const mongoose = require("mongoose");
mongoose.set("strictQuery", false);

const mongoDB = userArgs[0];

main().catch((err) => console.log(err));

async function main() {
	console.log("Debug: About to connect");
	await mongoose.connect(mongoDB);
	console.log("Debug: Should be connected?");
	await createCategories();
	await createItems();
	console.log("Debug: Closing mongoose");
	mongoose.connection.close();
}

// We pass the index to the ...Create functions so that, for example,
// category[0] will always be the Fantasy category, regardless of the order
// in which the elements of promise.all's argument complete.
async function categoryCreate(index, name, description) {
	const category = new Category({ name: name, description: description });
	await category.save();
	categories[index] = category;
	console.log(`Added category: ${name}`);
}

async function itemCreate(
	index,
	name,
	description,
	price,
	number_in_stock,
	category
) {
	const itemDetail = {
		name: name,
		description: description,
		price: price,
		number_in_stock: number_in_stock,
		category: category,
	};
	if (category != false) itemDetail.category = category;

	const item = new Item(itemDetail);
	await item.save();
	items[index] = item;
	console.log(`Added book: ${name}`);
}

async function createCategories() {
	console.log("Adding categories");
	await Promise.all([
		categoryCreate(0, "Computer", "PCs and all its components"),
		categoryCreate(
			1,
			"Phone",
			"Phone devices and accessories (not include gadgets)"
		),
		categoryCreate(
			2,
			"Furniture",
			"Furniture is a moveable object that is built for human use. It can be used for a variety of purposes"
		),
		categoryCreate(
			3,
			"Gadgets",
			"Mechanical, or electronic device that has a practical use"
		),
	]);
}

async function createItems() {
	console.log("Adding Items");
	await Promise.all([
		itemCreate(
			0,
			"Max Fort model 3",
			"PC gamer 64 ram, 1T ROM",
			900,
			5,
			categories[0]
		),
		itemCreate(
			1,
			"IPhone X",
			"The new generation of one in the palm of your hands",
			1500,
			2,
			categories[1]
		),
		itemCreate(
			2,
			"Redmi 9t",
			"4gm ram 64gb rom 54mp, 8mp frontal camera",
			100,
			16,
			categories[1]
		),
		itemCreate(3, "Optiplex 980", "10ram 300rom", 200, 10, categories[0]),
		itemCreate(4, "PC table", "White color", 50, 7, categories[2]),
		itemCreate(
			5,
			"Apple watch Series 9",
			"Powerful sensors, advanced health features.",
			500,
			3,
			categories[3]
		),
		itemCreate(
			6,
			"Apple watch Ultra 2",
			"The most rugged, and capable.",
			800,
			2,
			categories[3]
		),
		itemCreate(
			7,
			"Apple watch SE",
			"All the essentials. Light on price.",
			300,
			8,
			categories[3]
		),
	]);
}
