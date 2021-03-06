import dotenv from 'dotenv';
import express from 'express';
import bodyParser from 'body-parser';
import moviesRouter from './api/movies';
import './db';
import usersRouter from './api/users';
import peopleRouter from './api/people';
import genresRouter from './api/genres';
import session from 'express-session';
import passport from './authenticate';
import {loadUsers, loadMovies, loadPeople, loadUpcomingMovies, loadTopRatedMovies} from './seedData';
import loglevel from 'loglevel';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import fs from  'fs';
import swaggerUi from 'swagger-ui-express';
import * as swaggerDoucment from './swagger.json';

dotenv.config();

// create a write stream (in append mode) for logging
var accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });

const errHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message
  });
};

if (process.env.NODE_ENV === 'test') {
  loglevel.setLevel('warn');
 } else {
  loglevel.setLevel('info');
 }

if (process.env.SEED_DB === 'true' && process.env.NODE_ENV === 'development') {
  loadUsers();
  loadMovies();
  loadPeople();
  loadUpcomingMovies();
  loadTopRatedMovies();
}

const app = express();

//Set up default helmet security
app.use(helmet());
// setup the logger
app.use(morgan('combined', { stream: accessLogStream }));

const port = process.env.PORT;

app.use(express.static('public'));
//configure body-parser

app.use(passport.initialize());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(session({
  secret: 'ilikecake',
  resave: true,
  saveUninitialized: true
}));

app.use('/api/movies', moviesRouter);
app.use('/api/users', usersRouter);
app.use('/api/people', peopleRouter);
app.use('/api/genres', genresRouter);
app.use(errHandler);
app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerDoucment)); 
let server = app.listen(port, () => {
  loglevel.info(`Server running at ${port}`);
});

module.exports = server;