export type ReportStatus =
  | 'Submitted'
  | 'Under Review'
  | 'Verified'
  | 'Assigned'
  | 'In Progress'
  | 'Resolved'
  | 'Closed'
  | 'Rejected';

export type ReportPriority = 'Low' | 'Medium' | 'High' | 'Critical';

export type IssueCategory =
  | 'Infrastructure'
  | 'Environment'
  | 'Utilities'
  | 'Safety'
  | 'Public Services'
  | 'Other';

export interface ReportMedia {
  id: string;
  type: 'image' | 'video';
  url: string;
  name: string;
  size?: string;
}

export interface StatusHistoryItem {
  id: string;
  oldStatus: ReportStatus | 'None';
  newStatus: ReportStatus;
  changedBy: string;
  role: string;
  timestamp: string;
  notes?: string;
}

export interface ReportComment {
  id: string;
  userName: string;
  userRole: string;
  text: string;
  createdAt: string;
  isInternal: boolean;
}

export interface ReportAssignment {
  department: string;
  officerName: string;
  assignedBy: string;
  assignedAt: string;
  dueDate: string;
}

export interface ResolutionEvidence {
  photos: string[];
  notes: string;
  completedAt: string;
  completedBy: string;
}

export interface ResidentFeedback {
  satisfied: boolean;
  rating: number; // 1-5
  comments: string;
  submittedAt: string;
}

export interface ReportLocation {
  latitude: number;
  longitude: number;
  address: string;
  town: string;
  community: string;
}

export interface IssueReport {
  id: string;
  reportNumber: string; // e.g. CR-2026-004821
  title: string;
  description: string;
  category: IssueCategory;
  subCategory?: string;
  status: ReportStatus;
  priority: ReportPriority;
  location: ReportLocation;
  media: ReportMedia[];
  reporter: {
    fullName: string;
    email: string;
    phone: string;
    town: string;
    community: string;
    isAnonymous?: boolean;
  };
  reportedAt: string;
  updatedAt: string;
  resolvedAt?: string;
  slaTargetHours: number;
  assignment?: ReportAssignment;
  resolutionEvidence?: ResolutionEvidence;
  feedback?: ResidentFeedback;
  statusHistory: StatusHistoryItem[];
  comments: ReportComment[];
  potentialDuplicates?: string[]; // IDs of possible duplicate reports
}

export interface AuditLogEntry {
  id: string;
  reportId?: string;
  reportNumber?: string;
  action: string;
  actor: string;
  role: string;
  details: string;
  timestamp: string;
}

export type UserRole =
  | 'resident'
  | 'super_admin'
  | 'community_admin'
  | 'moderator'
  | 'field_officer'
  | 'viewer';
