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
  ordersCount: number;
  totalSpent: number;
}

export interface LoginUserBody {
  email: string;
  password: string;
}

export interface UserWithRole extends User {
  role?: { _id: string; name: string };
}

/** Passwords are never part of this type: new users receive an invite email instead. */
export type UserInput = Pick<
  User,
  "name" | "email" | "phone" | "roleId" | "status" | "address"
>;
