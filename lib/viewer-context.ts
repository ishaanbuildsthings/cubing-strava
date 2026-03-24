export type AuthUserContext = {
  type: "authUser";
  userId: string;
};

export type ViewerContext = AuthUserContext;
