import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class Notification extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    NotificationID: {
      type: DataTypes.UUID,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    UserID: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'user',
        key: 'UserID'
      }
    },
    title: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    type: {
      type: DataTypes.STRING(15),
      allowNull: true
    },
    role: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    actionLink: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  }, {
    sequelize,
    tableName: 'notification',
    schema: 'public',
    timestamps: true,
    timestamp: true,
    createdAt: 'createdAt',
    updatedAt: false,
    indexes: [
      {
        name: "notification_pkey",
        unique: true,
        fields: [
          { name: "NotificationID" },
        ]
      },
    ]
  });
  }
}

