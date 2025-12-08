'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Category extends Model {
    static associate(models) {
      // Одна категория имеет много задач
      Category.hasMany(models.Todo, {
        foreignKey: 'category_id',
        as: 'todos'
      });
    }
  }

  Category.init(
    {
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          notEmpty: { msg: 'Название категории не может быть пустым' },
          len: {
            args: [2, 100],
            msg: 'Название категории должно быть от 2 до 100 символов'
          }
        }
      }
    },
    {
      sequelize,
      modelName: 'Category',
      tableName: 'categories',
      timestamps: true,
      underscored: true
    }
  );

  return Category;
};