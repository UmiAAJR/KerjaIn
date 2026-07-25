import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class WorkerSkill extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    WorkerSkillID: {
      type: DataTypes.UUID,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    hourlyRate: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    WorkerID: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'worker',
        key: 'WorkerID'
      }
    },
    SkillID: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'skill',
        key: 'SkillID'
      }
    }
  }, {
    sequelize,
    tableName: 'worker_skill',
    schema: 'public',
    timestamps: false,
    timestamp: true,
    createdAt: 'createdAt',
    updatedAt: false,
    indexes: [
      {
        name: "worker_skill_pkey",
        unique: true,
        fields: [
          { name: "WorkerSkillID" },
        ]
      },
    ]
  });
  }
}
