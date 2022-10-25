const config = process.env.NODE_ENV == "production" ? require('./config.json') : require('./config.dev.json')
module.exports=config