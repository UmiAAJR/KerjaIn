import _sequelize from "sequelize";
const DataTypes = _sequelize.DataTypes;
import _Category from  "./Category.js";
import _Job from  "./Job.js";
import _Notification from  "./Notification.js";
import _Panic from  "./Panic.js";
import _Payment from  "./Payment.js";
import _Skill from  "./Skill.js";
import _User from  "./User.js";
import _Verify from  "./Verify.js";
import _Worker from  "./Worker.js";
import _WorkerSkill from  "./WorkerSkill.js";

export default function initModels(sequelize) {
  const Category = _Category.init(sequelize, DataTypes);
  const Job = _Job.init(sequelize, DataTypes);
  const Notification = _Notification.init(sequelize, DataTypes);
  const Panic = _Panic.init(sequelize, DataTypes);
  const Payment = _Payment.init(sequelize, DataTypes);
  const Skill = _Skill.init(sequelize, DataTypes);
  const User = _User.init(sequelize, DataTypes);
  const Verify = _Verify.init(sequelize, DataTypes);
  const Worker = _Worker.init(sequelize, DataTypes);
  const WorkerSkill = _WorkerSkill.init(sequelize, DataTypes);

  Skill.belongsTo(Category, { as: "Category", foreignKey: "CategoryID"});
  Category.hasMany(Skill, { as: "skills", foreignKey: "CategoryID"});
  Panic.belongsTo(Job, { as: "Job", foreignKey: "JobID"});
  Job.hasOne(Panic, { as: "Panic", foreignKey: "JobID"});
  Job.belongsTo(Payment, { as: "Payment", foreignKey: "PaymentID"});
  Payment.hasOne(Job, { as: "Job", foreignKey: "PaymentID"});
  WorkerSkill.belongsTo(Skill, { as: "Skill", foreignKey: "SkillID"});
  Skill.hasMany(WorkerSkill, { as: "Worker_skill", foreignKey: "SkillID"});
  Job.belongsTo(User, { as: "Client", foreignKey: "ClientID"});
  User.hasMany(Job, { as: "Job", foreignKey: "ClientID"});
  Worker.belongsTo(User, { as: "User", foreignKey: "UserID"});
  User.hasOne(Worker, { as: "Worker", foreignKey: "UserID"});
  Job.belongsTo(Worker, { as: "Worker", foreignKey: "WorkerID"});
  Worker.hasMany(Job, { as: "Job", foreignKey: "WorkerID"});
  Verify.belongsTo(Worker, { as: "Worker", foreignKey: "WorkerID"});
  Worker.hasOne(Verify, { as: "Verify", foreignKey: "WorkerID"});
  WorkerSkill.belongsTo(Worker, { as: "Worker", foreignKey: "WorkerID"});
  Worker.hasMany(WorkerSkill, { as: "Worker_skill", foreignKey: "WorkerID"});

  return {
    Category,
    Job,
    Notification,
    Panic,
    Payment,
    Skill,
    User,
    Verify,
    Worker,
    WorkerSkill,
  };
}
