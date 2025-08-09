import { DataSource } from "typeorm";

const AplusDataSource = new DataSource({
  type: "postgres",
  entities: ["src/entities/*.ts"],
  synchronize: true,

  host: process.env.ELDERBRAIN_HOST,
  port: parseInt(process.env.ELDERBRAIN_PORT ?? "5432"),
  database: process.env.ELDERBRAIN_DATABASE,
  username: process.env.ELDERBRAIN_USER,
  password: process.env.ELDERBRAIN_SECRET,
});

try {
  await AplusDataSource.initialize();
} catch (error) {
  console.error("Error initializing AplusDataSource:", error);
}

export default AplusDataSource;
