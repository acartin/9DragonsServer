const express = require('express')
const dotenv = require('dotenv')
const morgan = require('morgan')
const connectDB = require('./config/db')
const color = require('colors')
const errorHandler = require('./middleware/error')
const cookieParser = require('cookie-parser')
const cors = require('cors');


// Load env vars
dotenv.config({ path: './config/config.env' });

//connect to database
connectDB()


//route files
const bootcamps = require('./routes/bootcamps')
const courses = require('./routes/courses')
const auth = require('./routes/auth')
const betSlips = require('./routes/betSlips')

const app = express() //

//Body parser
app.use(express.json())

//Cookie parser
app.use(cookieParser())

// Dev Logging middleware
if(process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
  app.use(cors({ origin: `http://localhost:3000` }));
}

//Mount routers
app.use('/api/v1/bootcamps', bootcamps)
app.use('/api/v1/courses', courses)
app.use('/api/v1/auth', auth)
app.use('/api/v1/betSlips', betSlips)

//Mount error handler .
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold )
);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) =>{
  console.log(`Error: ${err.message}`.red)
  //close server and exit process
  server.close(() => process.exit(1))
})