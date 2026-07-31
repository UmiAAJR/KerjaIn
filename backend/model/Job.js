import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class Job extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    JobID: {
      type: DataTypes.UUID,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    startedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    finishedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    bookingDate: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    schedule: {
      type: DataTypes.DATE,
      allowNull: true
    },
    status: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    service: {
      type: DataTypes.STRING(100),
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
    ClientID: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'user',
        key: 'UserID'
      }
    },
    PaymentID: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'payment',
        key: 'PaymentID'
      }
    }
  }, {
    sequelize,
    tableName: 'job',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "job_pkey",
        unique: true,
        fields: [
          { name: "JobID" },
        ]
      },
      {
        name: "job_active",
        fields: ["status"],
        where: {
          status: "active"
        }
      }
    ]
  });
  }
}
