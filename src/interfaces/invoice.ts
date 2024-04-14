interface AccountTransactionValue {
  Id: number;
  Name: string;
  NVDate: string;
  Description: string;
  AccountTypeId: number;
  AccountId: number;
  Date: string;
  Debit: number;
  Credit: number;
  Exchange: number;
  AccountTransactionId: number;
  AccountTransactionDocumentId: number;
  entityLists: string;
  ref_invoice_number?: any;
  Sync_With_IRD: boolean;
  IS_Bill_Printed: boolean;
  IS_Bill_Active: boolean;
  Printed_Time: string;
  Real_Time: boolean;
  CompanyCode: number;
  NepaliMonth: string;
  FinancialYear: string;
  UserName?: any;
}

interface ISalesDetails {
  Id: number;
  OrderId: number;
  OrderNumber: number;
  ItemId: number;
  ItemName: string;
  Qty: number;
  UnitType: string;
  TotalAmount: number;
  UnitPrice: number;
  TaxRate: number;
  ExciseDuty: number;
  MRPPrice: number;
  Discount: number;
  OrderDescription?: any;
  Tags?: any;
  IsSelected: boolean;
  IsVoid: boolean;
  FinancialYear?: any;
  UserId?: any;
  BranchId: number;
  DepartmentId: number;
  WarehouseId: number;
}

export interface ISales {
  PurchaseDetails?: any;
  SalesOrderDetails: ISalesDetails[];
  AccountTransactionValues: AccountTransactionValue[];
  Id: number;
  Name: string;
  Amount: number;
  Discount: number;
  PercentAmount: number;
  NetAmount: number;
  VATAmount: number;
  ExciseDuty: 0.0;
  GrandAmount: number;
  IsDiscountPercentage: boolean;
  Date: string;
  NVDate: string;
  ExchangeRate: number;
  AccountTransactionDocumentId: number;
  AccountTransactionTypeId: number;
  SourceAccountTypeId: number;
  TargetAccountTypeId: number;
  Description?: any;
  IsReversed: boolean;
  Reversable: boolean;
  FinancialYear?: any;
  UserName?: any;
  ref_invoice_number: string;
  Sync_With_IRD: boolean;
  IS_Bill_Printed: boolean;
  IS_Bill_Active: boolean;
  Printed_Time: string;
  Real_Time: boolean;
  CompanyCode: number;
  DepartmentId: number;
  WareHouseId: number;
  BranchId: number;
  PhoteIdentity?: any;
  IdentityFileName?: any;
  IdentityFileType?: any;
  VehicleNo: string;
  VehicleLength: string;
  VehicleWidth: string;
  VehicleHeight: string;
  Print_Copy: number;
  Printed_by: string;
 ChallanNo : string;
}

export interface IProduct {
  Id: number;
  Name: string;
  ItemId: number;
  CategoryId: number;
  UnitPrice: number;
  Qty: number;
  DiscountE: number;
  ExciseDuty: number;
  UnitTypeBase?: any;
  UnitDivided: number;
  UnitType: string;
  DepartmentId: number;
  WareHouseId: number;
  BranchId: number;
  IsProduct: boolean;
  IsService: boolean;
  IsMenuItem: boolean;
  Description?: any;
  MetaDescription?: any;
  TaxRate: number;
  MarginRate: number;
  ItemCode?: any;
  PhoteIdentity?: any;
  IdentityFileName?: any;
  IdentityFileType?: any;
  CurrentStock?: any;
}
