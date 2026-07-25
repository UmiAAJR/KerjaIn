import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class Category extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    CategoryID: {
      type: DataTypes.UUID,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    icon: {
      type: DataTypes.STRING(100),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'category',
    schema: 'public',
    timestamps: false,
    timestamp: true,
    createdAt: 'createdAt',
    updatedAt: false,
    indexes: [
      {
        name: "category_pkey",
        unique: true,
        fields: [
          { name: "CategoryID" },
        ]
      },
    ]
  });
  }
}
