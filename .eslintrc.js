module.exports = {
    "extends": "standard",
    "plugins": [
        "standard",
        "promise"
    ],
    "env": {
        "mocha": true
    },
    "rules": {
        "semi": [2, "always"],  // 必须使用分号，且正确使用
        "no-multiple-empty-lines": 0,  // 不限制连续的空行数量
        "space-before-function-paren": [2, {  // 匿名函数需要空格，命名的不需要
            "anonymous": "always",
            "named": "never"
        }],
        "padded-blocks": 0
        // "no-unneeded-ternary": 0,  // 三目运算
        // "no-unused-vars": 1,  // 还是要报告声明但未使用的变量的
    }
};
