/** @format */

module.exports = {
    apps: [
        {
            name: "Kisarazu-Multi-Manager",
            script: "./build/botmain.mjs",
            instance_var: "INSTANCE_ID",
            env_dev: {
                NODE_ENV: "development"
            },
            env_stg: {
                NODE_ENV: "staging"
            },
            env_prod: {
                NODE_ENV: "production"
            },
            time: true,
        },
    ],
};
