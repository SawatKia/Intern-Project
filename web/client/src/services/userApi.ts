import { AxiosInstance } from "axios";

import { User } from "../interfaces/userInterface";
import auth from "./authenticationApi";
import getLogger from "../utils/logger";

const logger = getLogger("userApi");

class UserApi {
  client: AxiosInstance;
  private user: User | null;

  constructor() {
    // get baseUrl from authenticationApi
    this.client = auth.client;
    this.user = null;
    this.initUser();
  }
  private async initUser(): Promise<boolean> {
    try {
      const user_data = auth.getUser();
      this.user = user_data || null;
      return this.user !== null;
    } catch (error) {
      logger.error("Error initializing user:", error);
      return false;
    }
  }

  async register(
    username: string,
    email: string,
    password: string,
    confirm_password: string
  ): Promise<boolean> {
    try {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error("รูปแบบอีเมลไม่ถูกต้อง");
      }
      const body = {
        username,
        email,
        password,
        confirm_password,
      };
      logger.debug("register body: ", body);
      const result = await this.client.post("/manage/user", body, {
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      if (result.status === 201) {
        return true;
      }

      return false;
    } catch (error) {
      logger.error(`Error registering: ${error}`);
      throw error;
    }
  }
  async get_current_user(): Promise<User | null> {
    try {
      const response = await this.client.post("/manage/current_user");
      let user;
      if (response.status === 200) {
        user = response.data;
        return user.data;
      } else {
        logger.debug("cannot get_current_user, response: ", response);
        return null;
      }
    } catch (error) {
      logger.error("error in get_current_user, error: ", error);
      return null;
    }
  }
  //TODO - add new admin
  //TODO - edit user
  //TODO - delete user by admin
}
const user = new UserApi();
export default user;
