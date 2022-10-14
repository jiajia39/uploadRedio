import { NODE_ENV } from './../env';

const AppError = require('./../utils/appError');

const handeErrorUnauthorized = err => {
  const message = 'Invalid Token';
  return new AppError(message, 401);
};

const handleCastErrorDB = err => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldDB = err => {
  const keys = Object.keys(err.keyValue);
  const message = `Duplicate Field: ${keys}`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Invalid Input Data ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    code: err.statusCode,
    status: err.status,
    error: err,
    errorName: err.name,
    message: err.message,
  });
};

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      code: err.statusCode,
      status: err.status,
      message: err.message,
    });
  } else {
    console.error('ERROR 🔥', err);
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong with Source Code!',
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  if (NODE_ENV === 'development') {
    console.log(err.name);
    sendErrorDev(err, res);
  } else if (NODE_ENV === 'production') {
    let error = { ...err };
    console.log(err.name);
    if (err.name === 'CastError') error = handleCastErrorDB(error);
    if (err.name === 'UnauthorizedError') error = handeErrorUnauthorized(error);
    if (err.name === 'ValidationError') error = handleValidationErrorDB(error);
    if (err.code === 11000) error = handleDuplicateFieldDB(error);
    sendErrorProd(error, res);
  }
};
