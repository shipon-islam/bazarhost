export type UserStatus = "active" | "disabled" | "suspended";

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  roleId: string;
  status: UserStatus;
  address: string;
  avatarUrl: string | null;
  createdAt: string;
  lastLoginAt: string | null;
}

export interface UserWithRole extends User {
  roleName: string;
}

/** Passwords are never part of this type: new users receive an invite email instead. */
export type UserInput = Pick<User, "name" | "email" | "phone" | "roleId" | "status" | "address">;
