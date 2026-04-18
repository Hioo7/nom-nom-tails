import AppConfig from './config/AppConfig';
import createApp from './app';
import MinioStorage from './lib/minio';
import { MINIO_BUCKET } from './config/constants';

const config = AppConfig.getInstance();
const app = createApp();

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port} [${config.nodeEnv}]`);

  // Ensure MinIO bucket exists (creates it if missing)
  MinioStorage.getInstance()
    .ensureBucket(MINIO_BUCKET)
    .then(() => console.log(`MinIO bucket "${MINIO_BUCKET}" ready`))
    .catch((err: unknown) => console.error('MinIO bucket setup failed:', err));
});
