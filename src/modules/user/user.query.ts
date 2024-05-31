export enum UserQuery {
    FIND_ALL = "SELECT * FROM users",
    FIND_BY_ID = "SELECT * FROM users WHERE user_id =?",
    FIND_BY_INVITE_TOKEN = "SELECT * FROM users WHERE invite_token =?",
    SAVE = "INSERT INTO users (role_id, username, phone, email, password, isActive, current_session_id, reset_token, invite_token) VALUES (?,?,?,?,?,?,?,?,?)",
    CREATE = "INSERT INTO users (role_id, email, invite_token) VALUES (?,?,?)",
    DELETE_BY_ID = "DELETE FROM users WHERE user_id =?",
    FIND_BY_EMAIL = "SELECT * FROM users WHERE email =?",
    FIND_BY_RESET_TOKEN = "SELECT * FROM users WHERE reset_token =?",
  }
  
  export class UserQueryHelper {
    public static getQuery(query: UserQuery): string {
      return query;
    }
  }
  
  