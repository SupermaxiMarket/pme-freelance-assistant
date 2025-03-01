// backend/src/controllers/authController.js
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const crypto = require('crypto');

// Durée de validité des tokens
const ACCESS_TOKEN_EXPIRY = '15m'; // 15 minutes
const REFRESH_TOKEN_EXPIRY = '7d'; // 7 jours

// Génération des tokens
const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'default_secret',
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );
  
  const refreshToken = jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET || 'default_refresh_secret',
    { expiresIn: REFRESH_TOKEN_EXPIRY }
  );
  
  return { accessToken, refreshToken };
};

// Inscription d'un nouvel utilisateur
exports.register = async (req, res) => {
  try {
    const { name, email, password, businessType } = req.body;
    
    // Vérifier si l'email existe déjà
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cet email est déjà utilisé' 
      });
    }
    
    // Créer l'utilisateur
    const user = await User.create({
      name,
      email,
      password, // Le hash est fait automatiquement via les hooks du modèle
      businessType
    });
    
    // Générer les tokens
    const { accessToken, refreshToken } = generateTokens(user.id);
    
    // Réponse
    res.status(201).json({
      success: true,
      message: 'Inscription réussie',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        businessType: user.businessType,
        isPremium: user.isPremium
      },
      tokens: {
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de l\'inscription' 
    });
  }
};

// Connexion
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Rechercher l'utilisateur
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Email ou mot de passe incorrect' 
      });
    }
    
    // Vérifier le mot de passe
    const isPasswordValid = await user.verifyPassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        message: 'Email ou mot de passe incorrect' 
      });
    }
    
    // Générer les tokens
    const { accessToken, refreshToken } = generateTokens(user.id);
    
    // Réponse
    res.status(200).json({
      success: true,
      message: 'Connexion réussie',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        businessType: user.businessType,
        isPremium: user.isPremium
      },
      tokens: {
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la connexion' 
    });
  }
};

// Rafraîchir le token
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(401).json({ 
        success: false, 
        message: 'Refresh token manquant' 
      });
    }
    
    // Vérifier le refresh token
    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'default_refresh_secret', async (err, decoded) => {
      if (err) {
        return res.status(401).json({ 
          success: false, 
          message: 'Refresh token invalide ou expiré' 
        });
      }
      
      // Vérifier si l'utilisateur existe toujours
      const user = await User.findByPk(decoded.userId);
      if (!user) {
        return res.status(401).json({ 
          success: false, 
          message: 'Utilisateur introuvable' 
        });
      }
      
      // Générer un nouveau access token
      const newAccessToken = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET || 'default_secret',
        { expiresIn: ACCESS_TOKEN_EXPIRY }
      );
      
      // Réponse
      res.status(200).json({
        success: true,
        accessToken: newAccessToken
      });
    });
  } catch (error) {
    console.error('Erreur lors du rafraîchissement du token:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors du rafraîchissement du token' 
    });
  }
};

// Récupérer l'utilisateur courant
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.userId, {
      attributes: { exclude: ['password'] }
    });
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Utilisateur introuvable' 
      });
    }
    
    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la récupération de l\'utilisateur' 
    });
  }
};

// Mettre à jour l'utilisateur courant
exports.updateCurrentUser = async (req, res) => {
  try {
    const { name, email } = req.body;
    
    const user = await User.findByPk(req.userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Utilisateur introuvable' 
      });
    }
    
    // Mise à jour des informations
    user.name = name || user.name;
    user.email = email || user.email;
    
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Profil mis à jour avec succès',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        businessType: user.businessType,
        isPremium: user.isPremium
      }
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la mise à jour du profil' 
    });
  }
};

// Mot de passe oublié
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Aucun compte associé à cet email' 
      });
    }
    
    // Générer un token de réinitialisation
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Stocker le token (ici, on devrait l'enregistrer en base de données)
    // Pour l'exemple, on pourrait ajouter un champ resetToken au modèle User
    
    // Simuler l'envoi d'un email (dans une vraie implémentation, utiliser un service d'email)
    console.log(`Simuler envoi d'email de réinitialisation à ${email} avec token: ${resetToken}`);
    
    res.status(200).json({
      success: true,
      message: 'Un email de réinitialisation a été envoyé'
    });
  } catch (error) {
    console.error('Erreur lors de la demande de réinitialisation:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la demande de réinitialisation' 
    });
  }
};

// Réinitialiser le mot de passe
exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    
    // Vérifier le token (ici, on devrait le rechercher en base de données)
    // et récupérer l'ID utilisateur associé
    const userId = null; // À remplacer par la recherche du token
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'Token invalide ou expiré'
      });
    }
    
    // Mettre à jour le mot de passe
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }
    
    user.password = password;
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Mot de passe réinitialisé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la réinitialisation du mot de passe:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la réinitialisation du mot de passe' 
    });
  }
};

// Déconnexion
exports.logout = async (req, res) => {
  try {
    // Dans une implémentation réelle, vous pourriez invalider le refresh token
    // en le stockant dans une liste noire en base de données
    
    res.status(200).json({
      success: true,
      message: 'Déconnexion réussie'
    });
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la déconnexion' 
    });
  }
};
