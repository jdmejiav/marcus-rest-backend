const mongoose = require("mongoose")

const RecipeSchema = new mongoose.Schema({
    product: {
        type: String,
        required: true,
        unique: true
    },
    wp: {
        type: Number,
        required: true
    },
    dry: {
        type: Number,
        required: true
    }
})

const InventorySchema = new mongoose.Schema({
    inventory: Map
})

const MoveHistSameDaySchema = new mongoose.Schema({
    moveHistSameDay: [[]]
})

const MoveHistNextDaySchema = new mongoose.Schema({
    moveHistNextDay: [[]]
})
const NextdaySchema = new mongoose.Schema({
    id: Number,
    actions: String,
    date: Date,
    customer: String,
    product: String,
    po: Array,
    poDescription: Map,
    dry_boxes: Map,
    pull_date: String,
    wet_pack: Number,
    comment: String,
    priority: String,
    wo: String,
    exit_order: Number,
    receiving_comment: String,
    line: String,
    turno: String,
    assigned: String,
    made: String,
    order_status: String,
    scan_status: String,
    box_code: String,
    hargoods: String,
    hargoods_status: String,
})
const SamedaySchema = new mongoose.Schema({
    id: Number,
    actions: Object,
    date: Date,
    customer: String,
    product: String,
    po: Array,
    poDescription: Map,
    dry_boxes: Map,
    pull_date: String,
    wet_pack: Number,
    comment: String,
    priority: String,
    wo: String,
    exit_order: Number,
    receiving_comment: String,
    line: String,
    turno: String,
    assigned: String,
    made: String,
    order_status: String,
    scan_status: String,
    box_code: String,
    hargoods: String,
    hargoods_status: String,
})
const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    nombre: {
        type: String,
        required: true
    },
    apellido: {
        type: String,
        required: true
    },
    rol: {
        type: String
    }

})

const Recipe = mongoose.model("Recipe", RecipeSchema)
const Inventory = mongoose.model("Inventory", InventorySchema)
const MoveHistSameDay = mongoose.model("MoveHistSameDay", MoveHistSameDaySchema)
const MoveHistNextDay = mongoose.model("MoveHistNextDay", MoveHistNextDaySchema)
const SameDay = mongoose.model("SameDay", SamedaySchema)
const NextDay = mongoose.model("NextDay", NextdaySchema)
const User = mongoose.model("User", UserSchema)

module.exports = { Recipe, MoveHistSameDay, MoveHistNextDay, SameDay, NextDay, Inventory, User }