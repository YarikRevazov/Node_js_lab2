'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Todo extends Model {
    static associate(models) {
      // Каждая задача принадлежит категории
      Todo.belongsTo(models.Category, {
        foreignKey: 'category_id',
        as: 'category'
      });
    }
  }

  Todo.init(
    {
      title: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notEmpty: { msg: 'Название задачи не может быть пустым' },
          len: {
            args: [2, 120],
            msg: 'Название задачи должно быть от 2 до 120 символов'
          }
        }
      },
      completed: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      category_id: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      due_date: {
        type: DataTypes.DATE,
        allowNull: true
      }
    },
    {
      sequelize,
      modelName: 'Todo',
      tableName: 'todos',
      timestamps: true,
      underscored: true
    }
  );

  return Todo;
};