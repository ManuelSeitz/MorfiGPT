export interface AuthenticatedUser {
  id: string;
  name: string | null;
  email: string;
  emailVerified: boolean;
  avatar: string | null;
}

export type ApiError = {
  message: string;
};

export type DecodedAccessToken = {
  sub: string;
  name: string | null;
  email: string;
  emailVerified: boolean;
  avatar: string | null;
};
