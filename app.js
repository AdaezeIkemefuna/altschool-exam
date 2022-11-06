const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize')
const xss = require('xss-clean');
const morgan = require('morgan');
const blogRouter = require('./routes/blogRoutes');
const userRouter = require('./routes/userRoutes');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const app = express();
// 1)global middlewares
//set security http headers
app.use(helmet())

//development logging
if (process.env.NODE_ENV == 'development') {
  app.use(morgan('dev'));
}
//limit request from same ip
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many request from this IP, try again in an hour"
});

app.use('/api',limiter);

//body parser, reading data from body to req.body
app.use(
  express.json({
    limit: '10kb',
  })
);

//data sanitization against NOsql query injection and XSS
app.use(mongoSanitize());
app.use(xss());



//Test middlewware for setting request time
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

app.get('/', (req, res) => {
  res.send({ message: 'hello from app' });
});

app.use('/api/v1/blog', blogRouter);
app.use('/api/v1/users', userRouter);

app.all('*', (req, res, next) => {
  next(
    new AppError(`Cant find ${req._parsedOriginalUrl.pathname} on this server`)
  );
});

app.use(globalErrorHandler);

module.exports = app;
