import {
  Autocomplete,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TextField,
  Typography,
  LinearProgress,
} from "@mui/material";
import { Box } from "@mui/system";
import { useEffect, useState } from "react";
import { useHistory } from "react-router";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import GridDateHeader from "../../../components/headers/gridDateHeader";
import { updateBraDataAction } from "../../../features/braSlice";
import { getCurrentFinancialYear } from "../../../features/financialYearSlice";
import { setSortAction } from "../../../features/sortSlice";
import { IAllVoucher } from "../../../interfaces/voucher";
import {
  getAllReceipts,
  getAllReceiptsByBranchFilter,
} from "../../../services/receipt";
import { IsDateVerified } from "../../../utils/dateVerification";
import { errorMessage } from "../../../utils/messageBox/Messages";
import VoucherExcelTable from "../components/VoucherExcelTable";
interface IDateProps {
  StartDate: string;
  EndDate: string;
}
interface IOption {
  id: string;
  label: string;
}
interface HeadCell {
  sortable: boolean;
  id: string;
  label: string;
}
const mainHeader: readonly HeadCell[] = [
  {
    id:'VDate',
    label:"Date",
    sortable:true
  },
  {
    id:'particular',
    label:"Particular",
    sortable:false
  },
  {
    id:'VType',
    label:"Voucher Type",
    sortable:false
  },
  {
    id:'VoucherNo',
    label:"Voucher No.",
    sortable:true
  },
  {
    id:'debit',
    label:"Debit (RS.)",
    sortable:false
  },
  {
    id:'credit',
    label:"Credit (Rs.)",
    sortable:false
  },
  {
    id:'actions',
    label:"Actions",
    sortable:false
  }
];
// Actions options.
const actionOptions: IOption[] = [
  { id: "edit", label: "Edit" },
  { id: "view", label: "view" },
  { id: "delete", label: "Delete" },
];
//SOrt
function descendingComparator(a: any, b: any, orderBy: string) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}
function getComparator(
  order: Order,
  orderBy: string,
): (
  a: any ,
  b: any ,
) => number {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort(array: any, comparator: (a: any, b: any) => number) {
  const stabilizedThis = array.map((el:any, index:number) => [el, index] );
  stabilizedThis.sort((a:any, b:any) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) {
      return order;
    }
    return a[1] - b[1];
  });
  return stabilizedThis.map((el:any) => el[0]);
}

type Order = 'asc' | 'desc';

interface SortableTableProps {
  onRequestSort: (event: React.MouseEvent<unknown>, property: string) => void;
  order: Order;
  orderBy: string;
}
const SortableTableHead = ({ order, orderBy, onRequestSort }:SortableTableProps) =>{
  const createSortHandler =(property: string) => (event: React.MouseEvent<unknown>) => {
      onRequestSort(event, property);
  };
  const dispatch = useAppDispatch();
  useEffect(()=> {
    dispatch(setSortAction({order, orderBy}));
  },[order,orderBy,dispatch]);
  return(
    <TableHead>
      <TableRow>
        {mainHeader.map((data, index) => {
          return (
            <TableCell
            sx={{ backgroundColor:'primary.mainTableHeader' }}
              key={data.id}
              style={{
                minWidth:
                  data.label === "Particular"
                    ? "250px"
                    : data.label === "Actions"
                    ? "130px"
                    : "auto",
              }}
            >
    
              {data.sortable?(
                <TableSortLabel
                  active={orderBy === data.id}
                  direction={orderBy === data.id ? order : 'asc'}
                  onClick={createSortHandler(data.id)}
                >
                  {data.label}
                </TableSortLabel>
              ):data.label}
              
            </TableCell>
          );
        })}
      </TableRow>
    </TableHead>
  );
}
const Receipt = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const dispatch = useAppDispatch();
  const sortOptions = useAppSelector((state)=> state.sort);
  const [order, setOrder] = useState<Order>(sortOptions.order);
  const [orderBy, setOrderBy] = useState<string>(sortOptions.orderBy);
  const history = useHistory();
  const companyName = useAppSelector((state) => state.company.data.NameEnglish);
  const loginedUserRole = useAppSelector((state) => state.user.data.RoleName)
  const [receiptData, setReceiptData] = useState([]);
  const [totalDebit, setTotalDebit] = useState(0);
  const [totalCredit, setTotalCredit] = useState(0);
  // const [selectedBranch, setSelectedBranch] = useState<number>(0);
  const branch = useAppSelector((state) => state.branchData.data);
  const [selectbranchId, setSelectBranchId] = useState({...branch});
  const defaultDate = useAppSelector((state) => state.defaultDate);
  const FinancialYear = useAppSelector((state) => state.financialYear);
  const [dateChoose, setDateChoose] = useState<IDateProps>(
    defaultDate.EndDate === ""
      ? {
          StartDate: FinancialYear.NepaliStartDate,
          EndDate: FinancialYear.NepaliEndDate,
        }
      : defaultDate
    );

  const getData = async () => {
    setIsLoading(true);
    if(selectbranchId.branch === 0){
      const response = await getAllReceipts(
      dateChoose.StartDate,
      dateChoose.EndDate
      );
      if (response.length > 0) {
        setReceiptData(response);
        setIsLoading(false);
      }else{
        setIsLoading(false);
        errorMessage(`No data between ${dateChoose.StartDate} - ${dateChoose.EndDate}`);
      }
    }
    else if (selectbranchId.branch > 0) {
      const response = await getAllReceiptsByBranchFilter(
        dateChoose.StartDate,
        dateChoose.EndDate,
        selectbranchId.branch
      );
      if (response.length > 0) {
        setReceiptData(response);
        setIsLoading(false);
      }else{
        setIsLoading(false);
        errorMessage(`No data between ${dateChoose.StartDate} - ${dateChoose.EndDate}`);
      }
    }
    else{
      const response = await getAllReceipts(
      dateChoose.StartDate,
      dateChoose.EndDate
      );
      if (response.length > 0) {
        setReceiptData(response);
        setIsLoading(false);
      }else{
        setIsLoading(false);
        errorMessage(`No data between ${dateChoose.StartDate} - ${dateChoose.EndDate}`);
      }
    }
  };
  const getDataInSearch = async (e: any) => {
    e.preventDefault();
    setIsLoading(true);
    if (
      !IsDateVerified(dateChoose.StartDate, dateChoose.EndDate, FinancialYear)
    ) {
      errorMessage("Invalid Date !!!");
      return;
    }
    if (selectbranchId.branch === 0) {
      const response = await getAllReceiptsByBranchFilter(
        dateChoose.StartDate,
        dateChoose.EndDate,
        selectbranchId.branch
      );
      if (response.length > 0) {
        setReceiptData(response);
        setIsLoading(false);
      }else{
        setIsLoading(false);
        errorMessage(`No data between ${dateChoose.StartDate} - ${dateChoose.EndDate}`);
      }
    } else if(selectbranchId.branch > 0){
      const response = await getAllReceipts(
      FinancialYear.NepaliStartDate,
      FinancialYear.NepaliEndDate
      );
      if (response.length > 0) {
        setReceiptData(response);
        setIsLoading(false);
      }else{
        setIsLoading(false);
        errorMessage(`No data between ${dateChoose.StartDate} - ${dateChoose.EndDate}`);
      }
    }else {
      const response = await getAllReceipts(
        dateChoose.StartDate,
        dateChoose.EndDate
      );
      if (response.length > 0) {
        setReceiptData(response);
        setIsLoading(false);
      }else{
        setIsLoading(false);
        errorMessage(`No data between ${dateChoose.StartDate} - ${dateChoose.EndDate}`);
      }
    }
  };

  useEffect(() => {
    getData();
  }, []);

  //for branch
  const updateSelectedFormData = (name: string, value: number | 0) => {
    dispatch(updateBraDataAction({ name: "branch", value: value }));
    setSelectBranchId({ ...selectbranchId, ["branch"]: value });
  }

  useEffect(() => {
    let drTotal = 0;
    receiptData.forEach((element: any) => {
      drTotal = element.AccountTransactionValues.reduce(
        (pValue: number, current: any) => {
          return pValue + current.DebitAmount;
        },
        drTotal
      );
    });
    setTotalDebit(drTotal);
    let crTotal = 0;
    receiptData.forEach((element: any) => {
      crTotal = element.AccountTransactionValues.reduce(
        (pValue: number, current: any) => {
          return pValue + current.CreditAmount;
        },
        crTotal
      );
    });
    setTotalCredit(crTotal);
  }, [receiptData]);

  const editDeleteJournal = (id: number) => {
    history.push(`/receipt/${id}`);
  };

  const viewReceipt = (id: number) => {
    history.push(`/receipt/view/${id}`);
  };

  const setAction = (actionType: string, id: number) => {
    switch (actionType) {
      case "edit":
        if(loginedUserRole.includes("ReceiptEdit")){
          editDeleteJournal(id);
        break;
        }else{
          errorMessage("Sorry, permission denied.");
          break;
        }
      case "delete":
        if(loginedUserRole.includes("ReceiptDelete")){
          editDeleteJournal(id);
        break;
        }else{
          errorMessage("Sorry, permission denied.");
          break;
        }
      case "view":
        if(loginedUserRole.includes("ReceiptView")){
          viewReceipt(id);
          break;
        }else{
          errorMessage("Sorry, permission denied.");
          break;
        }
      default:
      // Do nothing.
    }
  };

  const handleRequestSort = (
    event: React.MouseEvent<unknown>,
    property: string,
  ) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  return (
    <>
      {loginedUserRole.includes("ReceiptAdd") ? 
        <GridDateHeader
          headerName={"Receipt Voucher"}
          dateChoose={dateChoose}
          setDateChoose={setDateChoose}
          getDataInSearch={getDataInSearch}
          path="/receipt/add"
          excel="true"
          pdf="true"
          PDF="true"
          onClickHandler={updateSelectedFormData}
          branch={selectbranchId.branch}
          fileName={`Receipt-voucher-report-${dateChoose.StartDate}-${dateChoose.EndDate}`} 
        /> :
        <GridDateHeader
          headerName={"Receipt Voucher"}
          dateChoose={dateChoose}
          setDateChoose={setDateChoose}
          getDataInSearch={getDataInSearch}
          path="RECADD"
          excel="true"
          pdf="true"
          PDF="true"
          onClickHandler={updateSelectedFormData}
          branch={selectbranchId.branch}
          fileName={`Receipt-voucher-report-${dateChoose.StartDate}-${dateChoose.EndDate}`}
        />
      }
      
      <Paper>
      {isLoading ? (
            <LinearProgress sx={{ marginTop: 3 }} />
          ) : (
            <TableContainer component={Paper}>
          <Box
            sx={{
              textAlign: "center",
              borderBottom: 1,
              py: 2,
              backgroundColor:'primary.mainTableHeader',
            }}
          >
            <Typography sx={{ fontWeight: "bold", fontSize: 18 }}>
              {companyName}
            </Typography>
            <Typography>Receipt Voucher</Typography>
            <Typography>
              {dateChoose.StartDate} - {dateChoose.EndDate}
            </Typography>
          </Box>

          <Table stickyHeader aria-label="sticky table" sx={{ minWidth: 650 }}>
            <SortableTableHead 
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
            />
            <TableBody>
              {stableSort(receiptData, getComparator(order, orderBy)).map((data:IAllVoucher, index:number) => {
                  return (
                    <>
                      <TableRow sx={{ backgroundColor:'primary.mainTableContent' }} id={index + "main"}>
                        <TableCell align="center">{data.VDate}</TableCell>
                        <TableCell align="right"></TableCell>
                        <TableCell align="center">{data.VType}</TableCell>
                        <TableCell align="center">{data.VoucherNo}</TableCell>
                        <TableCell align="right"></TableCell>
                        <TableCell align="right"></TableCell>
                        <TableCell>
                          <Autocomplete
                            disablePortal
                            options={actionOptions}
                            size="small"
                            value={null}
                            isOptionEqualToValue={(
                              option: IOption,
                              value: IOption
                            ) => option.id === value.id}
                            renderInput={(params) => (
                              <TextField {...params} label="Action" />
                            )}
                            onChange={(
                              event: any,
                              newValue: IOption | null
                            ) => {
                              if (newValue) {
                                setAction(newValue.id, data.Id);
                              }
                            }}
                          />
                        </TableCell>
                      </TableRow>
                      {data.AccountTransactionValues.map((value:any, ind: number) => {
                        return (
                          <>
                            <TableRow sx={{ backgroundColor:'primary.tableContent' }} id={ind + "val"}>
                              <TableCell align="right"></TableCell>
                              <TableCell colSpan={3} align="left">
                                {value.Name}
                              </TableCell>
                              <TableCell align="right">
                                {value.DebitAmount > 0 &&
                                  value.DebitAmount.toFixed(2)}
                              </TableCell>
                              <TableCell align="right">
                                {value.CreditAmount > 0 &&
                                  value.CreditAmount.toFixed(2)}
                              </TableCell>

                              <TableCell align="right"></TableCell>
                            </TableRow>
                          </>
                        );
                      })}
                    </>
                  );
                })}
            </TableBody>
            <TableRow>
              <TableCell colSpan={4} align="center">
                Total
              </TableCell>
              <TableCell align="right">
                {totalDebit && totalDebit.toFixed(2)}
              </TableCell>
              <TableCell align="right">
                {totalCredit && totalCredit.toFixed(2)}
              </TableCell>
            </TableRow>
          </Table>
        </TableContainer>
          )}
      </Paper>
      <VoucherExcelTable
        data={receiptData}
        date={dateChoose}
        name="Receipt Voucher"
      />
    </>
  );
};

export default Receipt;
