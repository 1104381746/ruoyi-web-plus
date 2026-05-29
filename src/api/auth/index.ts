import type { EmailCodeDTO, LoginDTO, LoginTenantVo, LoginVO, RegisterDTO, SocialLoginDTO } from './types';
import { get, post } from '@/utils/request';

export const login = (data: LoginDTO) => post<LoginVO>('/auth/login', data).json();

// 邮箱验证码
export const emailCode = (data: EmailCodeDTO) => post('/resource/email/code', data).json();

// 注册账号
export const register = (data: RegisterDTO) => post('/auth/register', data).json();

// 获取第三方授权跳转URL
export const getBindingUrl = (source: string, tenantId: string, domain: string) =>
  get<string>(`/auth/binding/${source}`, { tenantId, domain }).json();

// 第三方社交登录
export const socialLogin = (data: SocialLoginDTO) => post<LoginVO>('/auth/login', data).json();

// 获取租户列表
export const getTenantList = () => get<LoginTenantVo>('/auth/tenant/list').json();

// 查询注册功能是否开启
export const getRegisterEnabled = (tenantId: string) => get<boolean>('/auth/register/enabled', { tenantId }).json();
