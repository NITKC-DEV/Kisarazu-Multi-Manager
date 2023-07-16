export type EnvironmentConfig = {
    token: string;
    logSystem: string;
    errorSystem: string;
    client: string;
    daily: string;
    sugoiTsuyoiHitotachi: string[];
    devServer: string;
    db: string;
    maintenanceMode: boolean;
}

export type HelpText = {
    help: {
        shortDescription: string;
        value: {
            title: string;
            description: string;
            field: {
                name: string;
                value: string;
            }[];
        };
    }[];
    admin: {
        shortDescription: string;
        value: {
            title: string;
            description: string;
            field: {
                name: string;
                value: string;
            }[];
        };
    }[];
}