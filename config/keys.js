dbPassword = 'mongodb+srv://YOUR_USERNAME_HERE:'+ encodeURIComponent('YOUR_PASSWORD_HERE') + '@CLUSTER_NAME_HERE.mongodb.net/test?retryWrites=true';
const connectionURL = 'mongodb://localhost:27017/shopify';

module.exports = {
    mongoURI: connectionURL
};
