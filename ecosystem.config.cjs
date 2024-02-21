module.exports = {
    apps: [
        {
            name: "Kisarazu-Multi-Manager",
            script: "./src/botmain.js",
            instance_var: "INSTANCE_ID",
            env_dev: {
                NODE_ENV: "development",
            },
            env_prod: {
                NODE_ENV: "production",
            },
            time: true,
        },
    ],
};
