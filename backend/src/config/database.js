// backend/src/config/database.js
const { Sequelize } = require('sequelize');

// Récupérer les variables d'environnement
const {
  DB_HOST = 'localhost',
  DB_PORT = 5432,
  DB_NAME = 'admin_assistant',
  DB_USER = 'postgres',
  DB_PASSWORD = '',
  NODE_ENV = 'development'
} = process.env;

// Créer l'instance Sequelize
const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  port: DB_PORT,
  dialect: 'postgres',
  logging: NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

// Fonction pour tester la connexion
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connexion à la base de données établie avec succès.');
  } catch (error) {
    console.error('Impossible de se connecter à la base de données:', error);
  }
};

// Tester la connexion en environnement de développement
if (NODE_ENV === 'development') {
  testConnection();
}

module.exports = sequelize;
