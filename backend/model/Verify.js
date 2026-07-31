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
      type: DataTypes.TEXT,
      allowNull: true
    },
    selfiePhoto: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    status: {
      type: DataTypes.STRING(50),
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
