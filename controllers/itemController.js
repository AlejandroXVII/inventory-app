const Item = require("../models/item");
const Category = require("../models/category");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

exports.index = asyncHandler(async (req, res, next) => {
	const [numItems, numCategories] = await Promise.all([
		Item.countDocuments({}).exec(),
		Category.countDocuments({}).exec(),
	]);

	res.render("index", {
		title: "Inventory Home",
		item_count: numItems,
		category_count: numCategories,
	});
});

// Display list of all items.
exports.item_list = asyncHandler(async (req, res, next) => {
	const allItems = await Item.find({}, "name category")
		.sort({ name: 1 })
		.populate("category")
		.exec();

	res.render("item_list", { title: "Item List", item_list: allItems });
});

// Display detail page for a specific item.
exports.item_detail = asyncHandler(async (req, res, next) => {
	// Get details of items
	const item = await Item.findById(req.params.id).populate("category").exec();

	if (item === null) {
		// No results.
		const err = new Error("Item not found");
		err.status = 404;
		return next(err);
	}

	res.render("item_detail", {
		title: item.title,
		item: item,
	});
});

// Display item create form on GET.
exports.item_create_get = asyncHandler(async (req, res, next) => {
	// Get all categories, which we can use for adding to our item
	const allCategories = await Category.find().sort({ family_name: 1 }).exec();

	res.render("item_form", {
		title: "Create Item",
		categories: allCategories,
	});
});

// Handle item create on POST.
exports.item_create_post = [
	// Validate and sanitize fields.
	body("name", "name must not be empty.")
		.trim()
		.isLength({ min: 1 })
		.escape(),
	body("description", "description must not be empty.")
		.trim()
		.isLength({ min: 1 })
		.escape(),
	body("price", "price must not be empty")
		.trim()
		.isLength({ min: 1 })
		.escape(),
	body("number_in_stock", "number in stock must not be empty")
		.trim()
		.isLength({ min: 1 })
		.escape(),
	body("category", "Category must not be empty.")
		.trim()
		.isLength({ min: 1 })
		.escape(),

	// Process request after validation and sanitization.
	asyncHandler(async (req, res, next) => {
		// Extract the validation errors from a request.
		const errors = validationResult(req);

		// Create a Category object with escaped and trimmed data.
		const item = new Item({
			name: req.body.name,
			description: req.body.description,
			price: req.body.price,
			number_in_stock: req.body.number_in_stock,
			category: req.body.category,
		});

		if (!errors.isEmpty()) {
			// There are errors. Render form again with sanitized values/error messages.

			// Get all authors and genres for form.
			const allCategories = await Category.find()
				.sort({ name: 1 })
				.exec();

			res.render("Category_form", {
				title: "Create Item",
				categories: allCategories,
				item: item,
				errors: errors.array(),
			});
		} else {
			// Data from form is valid. Save item.
			await item.save();
			res.redirect(item.url);
		}
	}),
];

// Display item delete form on GET.
exports.item_delete_get = asyncHandler(async (req, res, next) => {
	// Get details of Category and all their categories (in parallel)
	const item = await Item.findById(req.params.id).exec();

	if (item === null) {
		// No results.
		res.redirect("/catalog/items");
	}

	res.render("item_delate", {
		title: "Delete Item",
		item: item,
	});
});

// Handle item delete on POST.
exports.item_delete_post = asyncHandler(async (req, res, next) => {
	await Item.findByIdAndDelete(req.body.itemRid);
	res.redirect("/catalog/items");
});

// Display item update form on GET.
exports.item_update_get = asyncHandler(async (req, res, next) => {
	// Get Category, all categories for form (in parallel)
	const [item, allCategories] = await Promise.all([
		Item.findById(req.params.id).populate("category").exec(),
		Category.find(),
	]);

	if (item === null) {
		// No results.
		const err = new Error("Category copy not found");
		err.status = 404;
		return next(err);
	}

	res.render("item_form", {
		title: "Update item",
		categories: allCategories,
		category: item.category._id,
		item: item,
	});
});

// Handle item update on POST.
exports.item_update_post = [
	// Validate and sanitize fields.
	body("name", "name must be specified").trim().isLength({ min: 1 }).escape(),
	body("description", "description must be specified")
		.trim()
		.isLength({ min: 1 })
		.escape(),
	body("price", "price must be specified")
		.trim()
		.isLength({ min: 1 })
		.escape(),
	body("number_in_stock", "number in stock must be specified")
		.trim()
		.isLength({ min: 1 })
		.escape(),
	body("category", "Category must be specified")
		.trim()
		.isLength({ min: 1 })
		.escape(),

	// Process request after validation and sanitization.
	asyncHandler(async (req, res, next) => {
		// Extract the validation errors from a request.
		const errors = validationResult(req);

		// Create a item object with escaped/trimmed data and current id.
		const item = new Item({
			name: req.body.name,
			description: req.body.description,
			price: req.body.price,
			number_in_stock: req.body.number_in_stock,
			_id: req.params.id,
		});

		if (!errors.isEmpty()) {
			// There are errors.
			// Render the form again, passing sanitized values and errors.

			const allCategories = await Category.find({}, "name").exec();

			res.render("item_form", {
				title: "Update item",
				categories: allCategories,
				category: item.category._id,
				errors: errors.array(),
				item: item,
			});
			return;
		} else {
			// Data from form is valid.
			await Item.findByIdAndUpdate(req.params.id, item, {});
			// Redirect to detail page.
			res.redirect(item.url);
		}
	}),
];
