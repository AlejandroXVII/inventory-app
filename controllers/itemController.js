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

		// Create a Book object with escaped and trimmed data.
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

			res.render("book_form", {
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
	res.send("NOT IMPLEMENTED: item delete GET");
});

// Handle item delete on POST.
exports.item_delete_post = asyncHandler(async (req, res, next) => {
	res.send("NOT IMPLEMENTED: item delete POST");
});

// Display item update form on GET.
exports.item_update_get = asyncHandler(async (req, res, next) => {
	res.send("NOT IMPLEMENTED: item update GET");
});

// Handle item update on POST.
exports.item_update_post = asyncHandler(async (req, res, next) => {
	res.send("NOT IMPLEMENTED: item update POST");
});
