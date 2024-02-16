const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const itemSchema = new Schema({
	name: { type: String, required: true, maxLength: 100 },
	description: { type: String, maxLength: 200 },
	price: { type: Number, required: true },
	number_in_stock: { type: Number, required: true },
	category: [{ type: Schema.Types.ObjectId, ref: "Category" }],
});

// Virtual for item's URL
itemSchema.virtual("url").get(function () {
	// We don't use an arrow function as we'll need the this object
	return `/catalog/item/${this._id}`;
});

// Export model
module.exports = mongoose.model("Item", itemSchema);
