const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Transaction = sequelize.define(
    "Transaction",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        auction_id: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: "auctions",
                key: "id",
            },
        },
        user_id: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: "users",
                key: "id",
            },
        },
        amount: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false,
        },
        status: {
            type: DataTypes.TEXT,
            allowNull: false,
            validate: {
                isIn: [["pending", "completed", "failed"]],
            },
        },
        payment_method: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        transaction_code: {
            type: DataTypes.TEXT,
            allowNull: false,
            unique: true,
        },
        transaction_type: {
            type: DataTypes.TEXT,
            allowNull: true,
            validate: {
                isIn: [["auction_win", "deposit", "refund", null]],
            },
        },
        payment_info: {
            type: DataTypes.JSONB,
            allowNull: true,
            defaultValue: null,
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        updated_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        timestamps: false,
        tableName: "transactions",
        underscored: true,
    }
);

module.exports = Transaction;
