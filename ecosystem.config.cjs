module.exports = {
    apps: [
        {
            name: "aquabioprocess",
            cwd: "/home/aqua",
            script: "node_modules/next/dist/bin/next",
            args: "start -p 3003",
            interpreter: "/root/.nvm/versions/node/v22.2.0/bin/node",
            instances: 1,
            exec_mode: "fork",
            env: {
                NODE_ENV: "production",
                PORT: "3003",
            },
        },
    ],
};
