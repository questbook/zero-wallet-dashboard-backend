import dotenv from 'dotenv';


// **** Load test env file **** //

const result2 = dotenv.config({
  path: `./env/development.env`,
});

if (result2.error) {
  throw result2.error;
}
