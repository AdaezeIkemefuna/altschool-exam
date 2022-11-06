const AppError = require('./../utils/appError');

const handCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/);
  const message = `Duplicate field Value ${value}. Please use another value`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid Input Data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJwtError = () => new AppError('Invalid Token,Please Login again');

const handleJwtExpiredError = () =>
  new AppError('Your Token has expired, pleas login again', 401);

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    stack: err.stack,
    error: err,
  });
};

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    console.error('ERROR!', err);
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!',
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    console.log(err);
    let error = err;
    if (error.name === 'CastError') {
      console.log('first ' + error.name);
      error = handCastErrorDB(error);
    }
    if (error.code === 11000) {
      console.log('second ' + error.name);
      error = handleDuplicateFieldsDB(error);
    }
    if (error.name === 'ValidationError') {
      console.log('third ' + error.name);
      error = handleValidationErrorDB(error);
    }
    if (error.name === 'JsonWebTokenError') {
      console.log('fourth ' + error.name);
      error = handleJwtError();
    }
    if (error.name === 'TokenExpiredError') {
      console.log('fifth ' + error.name);
      error = handleJwtExpiredError();
    }
    sendErrorProd(error, res);
  }
};
