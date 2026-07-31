import _sequelize from 'sequelize';
const { Model } = _sequelize;

export default class Report extends Model {
  static init(sequelize, DataTypes) {
    return super.init({
      ReportID: {
        type: DataTypes.UUID,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      reporterID: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'user',
          key: 'UserID'
        }
      },
      reportedWorkerID: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'worker',
          key: 'WorkerID'
        }
      },
      JobID: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'job',
          key: 'JobID'
        }
      },
      category: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      attachment: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      status: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: 'Pending'
      },
      timeline: {
        type: DataTypes.TEXT,
        allowNull: true
      }
    }, {
      sequelize,
      tableName: 'report',
      schema: 'public',
      timestamps: true
    });
  }
}
