import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class Skill extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    SkillID: {
      type: DataTypes.UUID,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(30),
      allowNull: true
    },
    CategoryID: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'category',
        key: 'CategoryID'
      }
    }
  }, {
    sequelize,
    tableName: 'skill',
    schema: 'public',
    timestamps: false,
    timestamp: true,
    createdAt: 'createdAt',
    updatedAt: false,
    indexes: [
      {
        name: "skill_pkey",
        unique: true,
        fields: [
          { name: "SkillID" },
        ]
      },
    ]
  });
  }
}
