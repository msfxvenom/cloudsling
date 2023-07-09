const { generate } = require("otp-generator");
function gencode() {
  return generate(6, {
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
    specialChars: false,
  });
}
module.exports.gencode = gencode;
