import express from 'express';
import {
  checkEmail,
  checkUsername,
  completeOnboarding,
  googleAuth,
  signIn,
  signOut,
  signUp,
} from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/signup', signUp);
router.post('/signin', signIn);
router.post('/google-auth', googleAuth);
router.post('/complete-onboarding', completeOnboarding);
router.post('/signout', signOut);
router.get('/check-username', checkUsername);
router.get('/check-email', checkEmail);

export default router;
