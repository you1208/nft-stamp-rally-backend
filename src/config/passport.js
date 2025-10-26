const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const prisma = require('../utils/prisma');
const { generateWallet, encryptPrivateKey } = require('../utils/wallet');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log('Google profile:', profile.id, profile.displayName, profile.emails[0].value);

        let user = await prisma.user.findUnique({
          where: {
            oauthProvider_oauthId: {
              oauthProvider: 'google',
              oauthId: profile.id,
            },
          },
        });

        if (!user) {
          const wallet = generateWallet();
          const encryptedPrivateKey = encryptPrivateKey(
            wallet.privateKey,
            process.env.JWT_SECRET
          );

          user = await prisma.user.create({
            data: {
              oauthProvider: 'google',
              oauthId: profile.id,
              email: profile.emails[0].value,
              displayName: profile.displayName,
              walletAddress: wallet.address,
            },
          });
          
          console.log('New user created with wallet:', user.id, wallet.address);
          console.log('Private key encrypted stored');
          console.log('IMPORTANT: Mnemonic:', wallet.mnemonic);
        } else {
          console.log('Existing user found:', user.id);
          
          if (!user.walletAddress) {
            const wallet = generateWallet();
            const encryptedPrivateKey = encryptPrivateKey(
              wallet.privateKey,
              process.env.JWT_SECRET
            );
            
            await prisma.user.update({
              where: { id: user.id },
              data: { walletAddress: wallet.address },
            });
            
            console.log('Wallet generated for existing user:', wallet.address);
            console.log('Private key encrypted stored');
            console.log('IMPORTANT: Mnemonic:', wallet.mnemonic);
            
            user.walletAddress = wallet.address;
          }
        }

        return done(null, user);
      } catch (error) {
        console.error('Google OAuth error:', error);
        return done(error, null);
      }
    }
  )
);

module.exports = passport;