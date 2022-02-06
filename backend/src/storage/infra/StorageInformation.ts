import S3StorageConfig from "../domain/S3Config";
import { getS3Config } from "../../config/index";

export default class StorageInformation {
  private readonly region: string;
  private readonly accessKeyId: string;
  private readonly secretAccessKey: string;

  constructor() {
    const s3Config = getS3Config();
    this.region = s3Config.AWS_BUCKET_REGION;
    this.accessKeyId = s3Config.AWS_ACCES_KEY_ID;
    this.secretAccessKey = s3Config.AWS_SECRET_ACCESS_KEY;
  }

  public getS3StorageConfig(): S3StorageConfig {
    return {
      accessKeyId: this.accessKeyId,
      region: this.region,
      secretAccessKey: this.secretAccessKey
    };
  }
}
