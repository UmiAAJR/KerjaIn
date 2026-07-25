import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class Verify extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    VerifyID: {
      type: DataTypes.UUID,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    ktpPhoto: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    selfiePhoto: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    status: {
      type: DataTypes.STRING(15),
      allowNull: true
    },
    submittedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    WorkerID: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'worker',
        key: 'WorkerID'
      }
    }
  }, {
    sequelize,
    tableName: 'verify',
    schema: 'public',
    timestamps: false,
    timestamp: true,
    createdAt: 'createdAt',
    updatedAt: false,
    indexes: [
      {
        name: "verify_pkey",
        unique: true,
        fields: [
          { name: "VerifyID" },
        ]
      },
    ]
  });
  }
}
