import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class Payment extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    PaymentID: {
      type: DataTypes.UUID,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    amount: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    status: {
      type: DataTypes.STRING(15),
      allowNull: true
    },
    snapToken: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    releasedAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'payment',
    schema: 'public',
    timestamps: true,
    timestamp: true,
    createdAt: 'createdAt',
    updatedAt: false,
    indexes: [
      {
        name: "payment_pkey",
        unique: true,
        fields: [
          { name: "PaymentID" },
        ]
      },
    ]
  });
  }
}
