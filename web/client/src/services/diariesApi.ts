import { AxiosInstance } from "axios";
import * as Post from "../interfaces/PostInterface";
import auth from "./authenticationApi";
import { User } from "../interfaces/userInterface";
import getLogger from "../utils/logger";
import { toZonedTime, format } from "date-fns-tz"; // Importing date-fns-tz
import { th } from "date-fns/locale";

const logger = getLogger("diariesApi");

// Utility function to convert UTC time to BKK time
const convertToBKKTime = (utcDate: string): string => {
  const parsedDate = new Date(utcDate + "Z");

  const timeZone = "Asia/Bangkok";
  const zonedDate = toZonedTime(parsedDate, timeZone);

  return format(zonedDate, "dd MMMM yyyy HH:mm", { timeZone, locale: th });
};

class DiariesApi {
  client: AxiosInstance;
  private user: User | null;
  private cache: {
    publicCount: number | null;
    privateCount: number | null;
  };

  constructor() {
    this.client = auth.client;
    this.user = null;
    this.cache = {
      publicCount: null,
      privateCount: null,
    };
    this.initUser();
  }

  private async initUser(): Promise<boolean> {
    try {
      const user_data = auth.getUser();
      this.user = user_data || null;
      logger.debug("initUser user: ", this.user);
      return this.user !== null;
    } catch (error) {
      logger.error("Error initializing user:", error);
      return false;
    }
  }

  async createDiaries(content: Post.Content, published: boolean, team: string) {
    try {
      await this.initUser();
      if (this.user != null) {
        const body = {
          content,
          published,
          team,
        };
        const response = await this.client.post("/diary/", body);
        if (response.status === 200) {
          return response.data;
        }
      } else {
        logger.error("User not found");
        return false;
      }
    } catch (error) {
      logger.error("Error creating post:", error);
      return false;
    }
  }

  async getPublicDiaries(team: string = "all"): Promise<{
    diaries: Post.Post_Interface[];
  }> {
    try {
      const response = await this.client.post(`/diary/publics/${team}`);

      const diaries = response.data.diaries || []; //get id
      logger.debug("getPublicDiaries diaries: ", diaries);
      const convertedDiaries = diaries.map((diary) => ({
        ...diary,
        created_stamp: convertToBKKTime(diary.created_stamp),
      }));

      return { diaries: convertedDiaries };
    } catch (error) {
      logger.error("Error getting public diaries:", error);
      return { diaries: [] }; // Return an object with default values
    }
  }

  // false = to get published diaries
  // true = to get private diaries
  async getUserDiaries(private_flag: boolean = false): Promise<{
    diaries: Post.Post_Interface[];
  }> {
    try {
      let api_path = "";
      if (private_flag) {
        api_path = "/diary/my_private";
      } else {
        api_path = "/diary/my_published";
      }
      const response = await this.client.post(api_path); //get _id
      const diaries = response.data.diaries || [];

      logger.debug("getUserDiaries diaries: ", diaries);

      const convertedDiaries = diaries.map((diary) => ({
        ...diary,
        created_stamp: convertToBKKTime(diary.created_stamp),
      }));

      // Update the cache
      if (private_flag) {
        this.cache.privateCount = response.data.count;
      } else {
        this.cache.publicCount = response.data.count;
      }
      return { diaries: convertedDiaries };
    } catch (error) {
      logger.error("Error getting user diaries:", error);
      return { diaries: [] };
    }
  }
  // false = to get published diaries
  // true = to get private diaries
  async getDiariesNumber(private_flag: boolean = false): Promise<number> {
    try {
      if (private_flag && this.cache.privateCount !== null) {
        return this.cache.privateCount;
      } else if (!private_flag && this.cache.publicCount !== null) {
        return this.cache.publicCount;
      }

      let api_path = "";
      if (private_flag) {
        api_path = "/diary/my_private";
      } else {
        api_path = "/diary/my_published";
      }
      const response = await this.client.post(api_path);
      if (response.status === 200) {
        // Update the cache
        if (private_flag) {
          this.cache.privateCount = response.data.count;
        } else {
          this.cache.publicCount = response.data.count;
        }
        return response.data.count;
      } else {
        return -1;
      }
    } catch (error) {
      logger.error("Error getting user diaries:", error);
      return -1;
    }
  }
  async get_diaries_by_id(id: string) {
    try {
      const response = await this.client.post(`/diary/id/${id}`);
      logger.debug("get_diaries_by_id response: ", response);
      if (response.status === 200) {
        const diary = response.data;
        const convertedDiary = {
          ...diary,
          created_stamp: convertToBKKTime(diary.created_stamp),
        };
        return convertedDiary;
      } else {
        return null;
      }
    } catch (error) {
      logger.error("Error getting user diaries:", error);
      return null;
    }
  }

  async update_diary(
    id: string,
    content?: Post.Content,
    published: boolean = false
  ) {
    try {
      let body;
      body = {
        published,
      };
      if (typeof content == "object") {
        body = {
          content,
          published,
        };
      }
      //NOTE - use the same team as the original doary
      const response = await this.client.put(`/diary/id/${id}`, body);
      logger.debug("updating response: ", response);
      if (response.status === 200) {
        if (this.cache.publicCount && this.cache.privateCount && published) {
          // if published
          this.cache.privateCount--;
        } else if (this.cache.publicCount && !published) {
          // if private
          this.cache.publicCount--;
        }
        return true;
      }
      return false;
    } catch (error) {
      //if error show ไม่สามามารถแก้ไขได้
      logger.error("Error updating user diary:", error);
      return false;
    }
  }

  async delete_diary(id: string) {
    try {
      const diaryToDelete = await this.get_diaries_by_id(id);
      const response = await this.client.delete(`/diary/id/${id}`);
      if (response.status === 200) {
        if (diaryToDelete.published && this.cache.publicCount) {
          // if published
          this.cache.publicCount--;
        } else if (!diaryToDelete.published && this.cache.privateCount) {
          // if private
          this.cache.privateCount--;
        }
        return true;
      }
      return false;
    } catch (error) {
      logger.error("Error deleting user diary:", error);
      return false;
    }
  }
}

const diaries = new DiariesApi();
export default diaries;
