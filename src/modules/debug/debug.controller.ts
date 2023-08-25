import { Controller, Get, Post, QueryParams, Req } from "routing-controllers";
import { AuthService } from "../auth/auth.service";
import { container, inject, injectable, Lifecycle, scoped } from "tsyringe";
import { Request } from "express";
import { OAuth2 } from "oauth";

@Controller()
@injectable()
export class DebugController {
  private readonly authService: AuthService;
  constructor() {
    this.authService = container.resolve(AuthService);
  }
  /*@Get("/auth")
  async getAuth(@Req() req: Request) {
    console.log("GET", req);
    return "AUTH GET";
  }

  @Post("/auth")
  async postAuth(@Req() req: Request) {
    console.log("POST", req);
    return "AUTH POST";
  }

  @Get("/auth/callback")
  async getAuthCB(@Req() req: Request) {
    console.log("GET", req);
    return "CALLBACK GET";
  }

  @Post("/auth/callback")
  async postAuthCB(@Req() req: Request) {
    console.log("POST", req);
    return "CALLBACK POST";
  }

  @Get("/")
  async getApp(@QueryParams() params: any) {
    const svc = container.resolve(AuthService);
    console.log(this.authService, svc);
    console.log("GET", params);
    // Get query parameters
    const valid = this.authService.validateHmac(params, params.hmac);

    const shop = params.shop;

    return valid ? "OK" : "NOT OK";
  }

  @Post("/")
  async postApp(@Req() req: Request) {
    console.log("POST", req);
    return "OK";
  }*/
}
