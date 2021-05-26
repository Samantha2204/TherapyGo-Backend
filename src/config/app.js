process.env.NODE_ENV = process.env.NODE_ENV || 'development';

module.exports = {
    port: process.env.PORT || 8000,
    api: {
        prefix: process.env.API_PREFIX || '/api/v1',
    },
    router: {
        prefix: process.env.ROUTER_PREFIX || 'routes/v1'
    },
    
    mongoose: 'mongodb+srv://admin:Password123@cluster0.rk2fn.mongodb.net/TherapyGo?retryWrites=true&w=majority',

    JWT_SECRET: 'therapy go secret',
};
