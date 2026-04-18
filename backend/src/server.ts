import AppConfig from './config/AppConfig';
import createApp from './app';

const config = AppConfig.getInstance();
const app = createApp();

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port} [${config.nodeEnv}]`);
});
