export interface Invite {
  id?: string;
  code: string;
  allowedDomains: string[];
  createdAt: Date;
  expiresAt: Date;
  status: "active" | "used" | "expired";
  updatedAt?: Date;
  usedAt?: Date;
  usedBy?: string;
}

export interface CreateInviteRequest {
  code: string;
  allowedDomains: string[];
  expiresAt: Date;
}

export interface InviteResponse {
  success: boolean;
  invite?: Invite;
  error?: string;
}

export interface InvitesListResponse {
  success: boolean;
  invites: Invite[];
  error?: string;
}
