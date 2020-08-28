import production from `../config/production`;
import development from `../config/development`;

const config =  process.env.NODE_ENV === 'production' ? production : development;

export default config;


