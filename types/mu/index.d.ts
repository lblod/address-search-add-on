type MuApplication = import('@types/express').Application;

declare module "mu" {
    const app: MuApplication;
}