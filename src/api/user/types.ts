export interface UserProfileVO {
  user?: {
    userId?: number;
    userName?: string;
    nickName?: string;
    email?: string;
    phonenumber?: string;
    sex?: string;
    avatar?: number;
    deptName?: string;
    loginIp?: string;
    loginDate?: string;
  };
  roleGroup?: string;
  postGroup?: string;
}

export interface UserProfileDTO {
  nickName?: string;
  email?: string;
  phonenumber?: string;
  sex?: string;
}

export interface UpdatePwdDTO {
  oldPassword: string;
  newPassword: string;
}
