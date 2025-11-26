import express, { Express } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import passport from 'passport';
import httpStatus from 'http-status';
import compression from 'compression';
import mongoSanitize from '@exortek/express-mongo-sanitize';
import config from './config/config';
import { successHandler, errorHandler } from './config/morgan';
import { jwtStrategy, googleStrategy } from './config/passport';
import { generalLimiter } from './middlewares/rateLimiter';
import { errorConverter, errorHandler as customErrorHandler } from './middlewares/error';
import ApiError from './utils/ApiError';
import routes from './routes/v1';

const app: Express = express();

// set security HTTP headers
app.use(helmet());

// enable cors
app.use(
  cors({
    origin: config.frontendUrl, // Allow frontend origin
    credentials: true, // Allow credentials (cookies, authorization headers)
  })
);

// parse json request body
app.use(express.json());

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

// sanitize request data
app.use(mongoSanitize({ replaceWith: '_' }));

// gzip compression
app.use(compression());

// jwt authentication
app.use(passport.initialize());
passport.use('jwt', jwtStrategy);
if (googleStrategy) {
  passport.use('google', googleStrategy);
}

// limit repeated failed requests to auth endpoints
if (config.env === 'production') {
  app.use('/api/v1/auth', generalLimiter);
}

// morgan logging
app.use(successHandler);
app.use(errorHandler);

// health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.env,
  });
});

// v1 api routes
app.use('/api/v1', routes);

// send back a 404 error for any unknown api request
app.use((_req, _res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, 'Not found'));
});

// convert error to ApiError, if needed
app.use(errorConverter);

// handle error
app.use(customErrorHandler);

export default app;
