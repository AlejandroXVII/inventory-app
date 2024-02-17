const Item = require("../models/item");
const Category = require("../models/category");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

// Display list of all categories.
exports.category_list = asyncHandler(async (req, res, next) => {
	const allCategories = await Category.find({}, "name")
		.sort({ name: 1 })
		.exec();

	res.render("category_list", {
		title: "Category List",
		category_list: allCategories,
	});
});

// Display detail page for a specific category.
exports.category_detail = asyncHandler(async (req, res, next) => {
	// Get details of items
	const [category, items] = await Promise.all([
		Category.findById(req.params.id).exec(),
		Item.find({ category: req.params.id }).exec(),
	]);

	if (category === null) {
		// No results.
		const err = new Error("Item not found");
		err.status = 404;
		return next(err);
	}

	res.render("category_detail", {
		title: category.title,
		category: category,
		item_list: items,
	});
});

// Display category create form on GET.
exports.category_create_get = asyncHandler(async (req, res, next) => {
	res.render("category_form", { title: "Create Category" });
});

// Handle category create on POST.
exports.category_create_post = [
	// Validate and sanitize the name field.
	body("name", "Category name must contain at least 3 characters")
		.trim()
		.isLength({ min: 3 })
		.escape(),

	// Process request after validation and sanitization.
	asyncHandler(async (req, res, next) => {
		// Extract the validation errors from a request.
		const errors = validationResult(req);

		// Create a genre object with escaped and trimmed data.
		const category = new Category({ name: req.body.name });

		if (!errors.isEmpty()) {
			// There are errors. Render the form again with sanitized values/error messages.
			res.render("category_form", {
				title: "Create Category",
				category: category,
				errors: errors.array(),
			});
			return;
		} else {
			// Data from form is valid.
			// Check if Category with same name already exists.
			const categoryExists = await Category.findOne({
				name: req.body.name,
			}).exec();
			if (categoryExists) {
				// Category exists, redirect to its detail page.
				res.redirect(categoryExists.url);
			} else {
				await category.save();
				// New category saved. Redirect to category detail page.
				res.redirect(category.url);
			}
		}
	}),
];

// Display category delete form on GET.
exports.category_delete_get = asyncHandler(async (req, res, next) => {
	res.send("NOT IMPLEMENTED: category delete GET");
});

// Handle category delete on POST.
exports.category_delete_post = asyncHandler(async (req, res, next) => {
	res.send("NOT IMPLEMENTED: category delete POST");
});

// Display category update form on GET.
exports.category_update_get = asyncHandler(async (req, res, next) => {
	res.send("NOT IMPLEMENTED: category update GET");
});

// Handle category update on POST.
exports.category_update_post = asyncHandler(async (req, res, next) => {
	res.send("NOT IMPLEMENTED: category update POST");
});
