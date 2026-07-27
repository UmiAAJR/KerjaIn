import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class Worker extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    WorkerID: {
      type: DataTypes.UUID,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    status: {
      type: DataTypes.STRING(15),
      allowNull: true
    },
    bankNumber: {
      type: DataTypes.STRING(16),
      allowNull: true
    },
    bankAccount: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    balance: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    UserID: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'user',
        key: 'UserID'
      }
    }
  }, {
    sequelize,
    tableName: 'worker',
    schema: 'public',
    timestamps: false,
    timestamp: true,
    createdAt: 'createdAt',
    updatedAt: false,
    indexes: [
      {
        name: "worker_pkey",
        unique: true,
        fields: [
          { name: "WorkerID" },
        ]
      },
    ]
  });
  }
}
