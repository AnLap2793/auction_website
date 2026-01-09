const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const AuctionWinner = sequelize.define(
    "AuctionWinner",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        auction_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: "auctions",
                key: "id",
            },
        },
        user_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: "users",
                key: "id",
            },
        },
        winning_bid: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false,
        },
        win_date: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        timestamps: false,
        tableName: "auction_winners",
        underscored: true,
    }
);

module.exports = AuctionWinner;
