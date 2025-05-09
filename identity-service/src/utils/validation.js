const j = require("joi");

const validateRegistration = (data) => {
  const schema = j.object({
    username: j.string().max(40).required(),
    email: j.string().email().required(),
    password: j.string().min(6).required(),
  });
  return schema.validate(data);
};

const validateLogin = (data) => {
  const schema = j.object({
    email: j.string().email().required(),
    password: j.string().min(6).required(),
  });
  return schema.validate(data);
};

module.exports = {
  validateLogin,
  validateRegistration,
};
