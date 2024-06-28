import axios, { AxiosInstance } from "axios";
import { User } from "../interfaces/userInterface";
import getLogger from "../utils/logger";

const API_URL = "/api/v1";

console.log("API_URL: ", API_URL);
const logger = getLogger("authenticationApi");

class AuthenticationApi {
  client: AxiosInstance;
  private user: User | null;

  constructor(baseUrl: string) {
    this.client = axios.create({
      baseURL: baseUrl,
      withCredentials: true,
    });
    this.user = null;
    this.checkConnection();
  }

  async checkConnection() {
    logger.info("Checking connection...");
    try {
      const response = await this.client.get("/ping");
      if (response.status === 200) {
        logger.info("ping ok, Connection Connected");
        return true;
      } else {
        logger.error("ping not ok, Cannot connect to server");
        return false;
      }
    } catch (error) {
      logger.error(`ping not successful, Error verifying connection: ${error}`);
      return false;
    }
  }

  async initializeUser() {
    try {
      const user = await this.refreshToken();
      if (!user) {
        throw new Error("Unable to initialize user");
      }
      this.user = user;
    } catch (error) {
      logger.error("Error initializing user: ", error);
    }
  }

  getUser() {
    if (!this.user) {
      this.initializeUser();
    }
    return this.user as User;
  }

  async refreshToken() {
    try {
      const user_data = await this.client.post("/authen/refresh", {
        headers: {
          accept: "application/json",
        },
      });

      if (user_data.data) {
        this.user = {
          id: user_data.data["id"],
          username: user_data.data["username"],
          email: user_data.data["email"],
          user_type: user_data.data["user_type"],
          member_since: user_data.data["member_since"],
          activated: user_data.data["activated"],
        };
        logger.debug("refreshed user: ", this.user);
        return this.user;
      } else {
        return null;
      }
    } catch (error) {
      logger.error(`Error refreshing token: ${error}`);
    }
  }

  async login(username: string, password: string) {
    try {
      const loginData = {
        username: username,
        password: password,
      };
      const response = await this.client.post("/authen/login", loginData, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.status === 200) {
        const userData = response.data;
        this.user = {
          id: userData.id,
          username: userData.username,
          email: userData.email,
          user_type: userData.user_type,
          member_since: userData.member_since,
          activated: userData.activated,
        };
        logger.debug("Logged in user: ", this.user);
        return true;
      } else {
        logger.debug(`Error logging in: ${response.statusText}`);
        return false;
      }
    } catch (error) {
      logger.error(`Error logging in: ${error}`);
      return false;
    }
  }

  async logout() {
    try {
      const result = await this.client.post("/authen/logout");
      this.user = null;
      return result.data;
    } catch (error) {
      logger.error(`Error logging out: ${error}`);
    }
  }

  async verify_credentials() {
    try {
      const result = await this.client.post("/authen/verify");
      logger.debug(`verify_credentials result: ${result}`);
      return result.status === 200;
    } catch (error) {
      logger.error(`verify_credentials error: ${error}`);
    }
  }
}

const auth = new AuthenticationApi(API_URL);

export default auth;
