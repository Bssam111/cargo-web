import { Timestamp } from 'firebase/firestore';

export type UserRole = 'admin' | 'employee' | 'owner' | 'renter';

export type CarStatus =
  | 'awaiting_owner_dropoff'
  | 'awaiting_employee_verification'
  | 'delivery_rejected'
  | 'pending_inspection'
  | 'at_hub'
  | 'ready_for_rental'
  | 'in_trip'
  | 'returned'
  | 'maintenance'
  | 'inactive';

export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'in_trip'
  | 'completed'
  | 'cancelled'
  | 'rejected';

export type PickupStatus = 'pending_employee_confirmation' | 'confirmed';
export type ReturnStatus = 'not_returned' | 'returned' | 'confirmed';
export type InspectionType = 'dropoff_inspection' | 'return_inspection';
export type FuelLevel = 'empty' | 'quarter' | 'half' | 'three_quarters' | 'full';
export type Condition = 'poor' | 'fair' | 'good' | 'excellent';
export type PayoutStatus = 'pending' | 'approved' | 'rejected' | 'paid';

export interface PortalUser {
  uid: string;
  email: string;
  fullName: string;
  phone: string;
  role?: UserRole;    // legacy single-role field
  roles?: string[];   // newer array-format role field
  nationalId?: string;
  licenseUrl?: string;
  isActive: boolean;
  createdAt: Timestamp | Date;
}

export interface Employee {
  uid: string;
  email: string;
  fullName: string;
  phone: string;
  employeeId: string;
  role: 'employee';
  hubLocation: string;
  isActive: boolean;
  createdAt: Timestamp | Date;
}

export interface Car {
  carId: string;
  ownerId: string;
  ownerName?: string;
  brand: string;
  model: string;
  year?: number;
  plateNumber?: string;
  color?: string;
  images: string[];
  pricePerDay: number;
  status: CarStatus;
  hubLocation: string;
  isVerifiedAtHub: boolean;
  verifiedByEmployeeId?: string;
  verifiedAt?: Timestamp | Date | null;
  availableFrom?: Timestamp | Date;
  availableTo?: Timestamp | Date;
  location?: string;
  hubStatus?: string;
  deliveryRequestedAt?: Timestamp | Date | null;
  rejectionReason?: string | null;
  updatedAt: Timestamp | Date;
  createdAt: Timestamp | Date;
}

export interface Booking {
  bookingId: string;
  carId: string;
  ownerId: string;
  renterId: string;
  renterName?: string;
  ownerName?: string;
  carBrand?: string;
  carModel?: string;
  carImage?: string;
  status: BookingStatus;
  pickupStatus?: PickupStatus;
  returnStatus?: ReturnStatus;
  pickupConfirmedBy?: string;
  returnConfirmedBy?: string;
  startDate: Timestamp | Date;
  endDate: Timestamp | Date;
  totalAmount: number;
  platformFee: number;
  ownerEarning: number;
  notes?: string;
  createdAt: Timestamp | Date;
  updatedAt?: Timestamp | Date;
}

export interface Inspection {
  inspectionId: string;
  carId: string;
  bookingId?: string;
  type: InspectionType;
  employeeId: string;
  employeeName?: string;
  odometer: number;
  fuelLevel: FuelLevel;
  exteriorCondition: Condition;
  interiorCondition: Condition;
  tireCondition: Condition;
  cleanliness: Condition;
  damageNotes: string;
  photos: string[];
  createdAt: Timestamp | Date;
}

export interface DamageReport {
  reportId: string;
  carId: string;
  bookingId: string;
  inspectionId: string;
  employeeId: string;
  description: string;
  severity: 'minor' | 'moderate' | 'severe';
  photos: string[];
  estimatedCost?: number;
  status: 'open' | 'resolved';
  createdAt: Timestamp | Date;
}

export interface Wallet {
  ownerId: string;
  balance: number;
  pendingBalance: number;
  totalEarned: number;
  updatedAt: Timestamp | Date;
}

export interface Transaction {
  transactionId: string;
  type: 'booking_earning' | 'withdrawal' | 'platform_fee' | 'refund';
  amount: number;
  ownerId?: string;
  bookingId?: string;
  description: string;
  createdAt: Timestamp | Date;
}

export interface Payout {
  payoutId: string;
  ownerId: string;
  ownerName?: string;
  ownerEmail?: string;
  amount: number;
  status: PayoutStatus;
  bankDetails?: {
    bankName: string;
    accountNumber: string;
    iban: string;
  };
  requestedAt: Timestamp | Date;
  processedAt?: Timestamp | Date | null;
  processedBy?: string;
  notes?: string;
}

export interface AdminLog {
  logId: string;
  adminId: string;
  adminName?: string;
  action: string;
  targetType: string;
  targetId: string;
  details: Record<string, unknown>;
  createdAt: Timestamp | Date;
}

export interface MonthlyRevenue {
  month: string;
  revenue: number;
  bookings: number;
  commission: number;
}

export interface DashboardStats {
  totalEarnings: number;
  totalBookings: number;
  activeBookings: number;
  completedBookings: number;
  pendingBookings: number;
  totalOwners: number;
  totalRenters: number;
  totalCars: number;
  carsAtHub: number;
  carsInTrip: number;
  pendingPayouts: number;
  completedPayouts: number;
  monthlyRevenue: MonthlyRevenue[];
}

export interface EmployeeDashboardStats {
  pendingDropoffs: number;
  pendingInspections: number;
  readyCars: number;
  todayPickups: number;
  todayReturns: number;
  openDamageReports: number;
  totalInventory: number;
}
