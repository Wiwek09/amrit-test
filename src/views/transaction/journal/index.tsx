import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Box,
  Autocomplete,
  TextField,
  TableSortLabel,
  LinearProgress,
} from "@mui/material";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { IAllVoucher } from "../../../interfaces/voucher";
import {
  getAllJournals,
  getAllJournalsByBranchFilter,
} from "../../../services/journalApi";
import GridDateHeader from "../../../components/headers/gridDateHeader";
import { getCurrentFinancialYear } from "../../../features/financialYearSlice";
import { useHistory } from "react-router";
import VoucherExcelTable from "../components/VoucherExcelTable";
import { IsDateVerified } from "../../../utils/dateVerification";
import { errorMessage } from "../../../utils/messageBox/Messages";
import { setSortAction } from "../../../features/sortSlice";
import { updateBraDataAction } from "../../../features/braSlice";

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
const Journal = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const sortOptions = useAppSelector((state)=> state.sort);
  const [order, setOrder] = useState<Order>(sortOptions.order);
  const [orderBy, setOrderBy] = useState<string>(sortOptions.orderBy);
  const history = useHistory();
  const companyName = useAppSelector((state) => state.company.data.NameEnglish);
  const loginedUserRole = useAppSelector((state) => state.user.data.RoleName)
  const [journalData, setjournalData] = useState([]);
  // const [selectedBranch, setSelectedBranch] = useState<number>(0);
  const dispatch = useAppDispatch();
  const branch = useAppSelector((state) => state.branchData.data);
  const [selectbranchId, setSelectBranchId] = useState({...branch});
  const [totalDebit, setTotalDebit] = useState(0);
  const [totalCredit, setTotalCredit] = useState(0);
  const defaultDate = useAppSelector((state) => state.defaultDate);
  const FinancialYear = useAppSelector(getCurrentFinancialYear);
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
      const response = await getAllJournals(
        dateChoose.StartDate,
        dateChoose.EndDate
      );
      if (response.length > 0) {
        setjournalData(response);
        setIsLoading(false);
      }else{
        setIsLoading(false);
        errorMessage(`No data between ${dateChoose.StartDate} - ${dateChoose.EndDate}`);
      }
    }
    else if (selectbranchId.branch > 0) {
      const response = await getAllJournalsByBranchFilter(
        dateChoose.StartDate,
        dateChoose.EndDate,
        selectbranchId.branch
      );
      if (response.length > 0) {
        setjournalData(response);
        setIsLoading(false);
      }else{
        setIsLoading(false);
        errorMessage(`No data between ${dateChoose.StartDate} - ${dateChoose.EndDate}`);
      }
    }
    else {
      const response = await getAllJournals(
        dateChoose.StartDate,
        dateChoose.EndDate
      );
      if (response.length > 0) {
        setjournalData(response);
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
    if(selectbranchId.branch === 0) {
      const response = await getAllJournals(
        dateChoose.StartDate,
        dateChoose.EndDate
      );
      if (response.length > 0) {
        setjournalData(response);
        setIsLoading(false);
      }else{
        errorMessage(`No data between ${dateChoose.StartDate} - ${dateChoose.EndDate}`);
      }
    }
    else if (selectbranchId.branch > 0) {
      const response = await getAllJournalsByBranchFilter(
        dateChoose.StartDate,
        dateChoose.EndDate,
        selectbranchId.branch
      );
      if (response.length > 0) {
        setjournalData(response);
        setIsLoading(false);
      }else{
        errorMessage(`No data between ${dateChoose.StartDate} - ${dateChoose.EndDate}`);
      }
    }
    else {
      const response = await getAllJournals(
        dateChoose.StartDate,
        dateChoose.EndDate
      );
      if (response.length > 0) {
        setjournalData(response);
        setIsLoading(false);
      }else{
        errorMessage(`No data between ${dateChoose.StartDate} - ${dateChoose.EndDate}`);
      }
    }
  };

  useEffect(() => {
    getData();
  }, []);

  useEffect(() => {
    let drTotal = 0;
    journalData.forEach((element: any) => {
      drTotal = element.AccountTransactionValues.reduce(
        (pValue: number, current: any) => {
          return pValue + current.DebitAmount;
        },
        drTotal
      );
    });
    setTotalDebit(drTotal);
    let crTotal = 0;
    journalData.forEach((element: any) => {
      crTotal = element.AccountTransactionValues.reduce(
        (pValue: number, current: any) => {
          return pValue + current.CreditAmount;
        },
        crTotal
      );
    });
    setTotalCredit(crTotal);
  }, [journalData]);

  const actionOptions: IOption[] = [
    { id: "edit", label: "Edit" },
    { id: "view", label: "view" },
    { id: "delete", label: "Delete" },
  ];

  const editDeleteJournal = (id: number) => {
    history.push(`/journal-voucher/${id}`);
  };

  const goToView = (id: number) => {
    history.push(`journal/view/${id}`);
  };

  const setAction = (actionType: string, id: number) => {
    switch (actionType) {
      case "edit":
        if(loginedUserRole.includes("JournalEdit")){
          editDeleteJournal(id);
          break;
        }else{
          errorMessage("Sorry, permission denied.");
          break;
        }
      case "delete":
        if(loginedUserRole.includes("JournalDelete")){
          editDeleteJournal(id);
          break;
        }else{
          errorMessage("Sorry, permission denied.");
          break;
        }
      case "view":
        if(loginedUserRole.includes("JournalView")){
          goToView(id);
          break;
        }else{
          errorMessage("Sorry, permission denied.");
          break;
        }
      default:
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

  //for branch
  const updateSelectedFormData = (name: string, value: number | 0) => {
    dispatch(updateBraDataAction({ name: "branch", value: value }));
    setSelectBranchId({ ...selectbranchId, ["branch"]: value });
  }

  return (
    <>
      {
        loginedUserRole.includes("JournalAdd") ?
        <GridDateHeader
          headerName={"Journal Voucher"}
          dateChoose={dateChoose}
          setDateChoose={setDateChoose}
          getDataInSearch={getDataInSearch}
          excel="true"
          pdf="true"
          PDF="true"
          path="/journal-voucher/add"
          onClickHandler={updateSelectedFormData}
          branch={selectbranchId.branch}
          fileName={`journal-voucher-report-${dateChoose.StartDate}-${dateChoose.EndDate}`}
        /> :
        <GridDateHeader
          headerName={"Journal Voucher"}
          dateChoose={dateChoose}
          setDateChoose={setDateChoose}
          getDataInSearch={getDataInSearch}
          excel="true"
          pdf="true"
          PDF="true"
          path="JOUADD"
          onClickHandler={updateSelectedFormData}
          branch={selectbranchId.branch}
          fileName={`journal-voucher-report-${dateChoose.StartDate}-${dateChoose.EndDate}`}
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
              <Typography>Journal Voucher</Typography>
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
                {stableSort(journalData, getComparator(order, orderBy)).map((data:IAllVoucher, index:number) => {
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
                        {data.AccountTransactionValues.map((value, ind) => {
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
        data={journalData}
        date={dateChoose}
        name="Journal Voucher"
      />
    </>
  );
};

export default Journal;
