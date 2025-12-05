// backend/src/middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware pour vérifier le token JWT et authentifier l'utilisateur
exports.authenticate = async (req, res, next) => {
  try {
    // Récupérer le token d'autorisation
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Accès non autorisé. Token manquant.'
      });
    }
    
    // Extraire le token
    const token = authHeader.split(' ')[1];
    
    // Vérifier le token
    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(401).json({
          success: false,
          message: 'Token invalide ou expiré'
        });
      }
      
      // Vérifier que l'utilisateur existe toujours
      const user = await User.findByPk(decoded.userId);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Utilisateur non trouvé'
        });
      }
      
      // Attacher l'ID de l'utilisateur à la requête
      req.userId = decoded.userId;
      next();
    });
  } catch (error) {
    console.error('Erreur d\'authentification:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'authentification'
    });
  }
};

// Middleware pour vérifier les permissions premium
exports.checkPremium = async (req, res, next) => {
  try {
    // Récupérer l'utilisateur
    const user = await User.findByPk(req.userId);
    
    // Vérifier si l'utilisateur a un abonnement premium
    if (!user.isPremium) {
      return res.status(403).json({
        success: false,
        message: 'Cette fonctionnalité nécessite un abonnement premium'
      });
    }
    
    next();
  } catch (error) {
    console.error('Erreur lors de la vérification premium:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la vérification des permissions'
    });
  }
};
