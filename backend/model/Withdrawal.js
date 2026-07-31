import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class Withdrawal extends Model {
  static init(sequelize, DataTypes) {
    return super.init({
      WithdrawalID: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true
      },
      WorkerID: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'worker',
          key: 'WorkerID'
        }
      },
      amount: {
        type: DataTypes.BIGINT,
        allowNull: false
      },
      bankName: {
        type: DataTypes.STRING(50),
        allowNull: true
      },
      bankNumber: {
        type: DataTypes.STRING(50),
        allowNull: true
      },
      bankAccount: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      status: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: 'PENDING_APPROVAL'
      },
      approvedAt: {
        type: DataTypes.DATE,
        allowNull: true
      }
    }, {
      sequelize,
      tableName: 'withdrawal',
      schema: 'public',
      timestamps: true,
      indexes: [
        {
          name: "withdrawal_pkey",
          unique: true,
          fields: [
            { name: "WithdrawalID" },
          ]
        },
      ]
    });
  }
}
