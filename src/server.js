/* eslint-disable no-console */
import chalk from 'chalk';
import app from './app';

// init environment variables based on configuration env (dev or prod)
const PORT = process.env.PORT;
const HOST = process.env.HOST;

const teal500 = chalk.hex('#009688');

app.listen(Number(PORT), HOST, () => {
  console.log(`App running on ${process.env.NODE_ENV}`);
  console.log(teal500('🚀  App: Bootstrap Succeeded'));
  console.log(teal500(`🚀  Host: http://${HOST}:${PORT}`));

  // mongoose.connection
  //   .on('open', () => console.log(teal500('🚀  MongoDB: Connection Succeeded')))
  //   .on('error', err => console.error(err));
});
