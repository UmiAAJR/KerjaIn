import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class Panic extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    PanicID: {
      type: DataTypes.UUID,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    status: {
      type: DataTypes.STRING(15),
      allowNull: true
    },
    longitude: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    latitude: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    JobID: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'job',
        key: 'JobID'
      }
    },
    HistoryID: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'history',
        key: 'HistoryID'
      }
    }
  }, {
    sequelize,
    tableName: 'panic',
    schema: 'public',
    timestamps: true,
    timestamp: true,
    createdAt: 'createdAt',
    updatedAt: false,
    indexes: [
      {
        name: "panic_pkey",
        unique: true,
        fields: [
          { name: "PanicID" },
        ]
      },
    ]
  });
  }
}
