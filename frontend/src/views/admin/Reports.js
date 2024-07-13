/* eslint-disable no-unused-vars */
import { useEffect, useState } from 'react';
import DataTable from 'react-data-table-component';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Card,
  CardBody,
  Col,
  Container,
  Input,
  InputGroup,
  InputGroupText,
  Row,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem
} from 'reactstrap';
import { ChevronDown, MoreVertical, Archive, Search } from 'react-feather';
import { useGetReportsQuery } from '../../redux/api/reportAPI';

const Reports = () => {
  const [searchItem, setSearchItem] = useState('');
  const navigate = useNavigate();
  const paginationRowsPerPageOptions = [15, 30, 50, 100];
  const { data: reports, refetch: refetchReport } = useGetReportsQuery();

  useEffect(() => {
    refetchReport();
  }, [refetchReport]);

  console.log(reports);

  const handleFilter = (q) => {
    setSearchItem(q);
  };

  const columns = () => [
    {
      name: 'Order Number',
      maxwidth: '100px',
      selector: (row) => `${row.order?.orderNumber}`,
      sortable: true
    },
    {
      name: 'Reportor',
      maxwidth: '100px',
      selector: (row) => `${row.reportor?.firstName} ${row.reportor?.lastName}`,
      sortable: true
    },
    {
      name: 'Title',
      maxwidth: '100px',
      selector: (row) => `${row.title}`,
      sortable: true
    },
    {
      name: 'Actions',
      width: '120px',
      cell: (row) => {
        return (
          <>
            <UncontrolledDropdown>
              <DropdownToggle tag="div" className="btn btn-sm">
                <MoreVertical size={14} className="cursor-pointer action-btn" />
              </DropdownToggle>
              <DropdownMenu end container="body">
                <DropdownItem className="w-100" onClick={() => navigate(`/admin/reports/report-review/${row._id}`)}>
                  <Archive size={14} className="mr-50" />
                  <span className="align-middle mx-2">Review</span>
                </DropdownItem>
              </DropdownMenu>
            </UncontrolledDropdown>
          </>
        );
      }
    }
  ];

  return (
    <div className="main-view">
      <Container>
        <Row className="my-3">
          <Col>
            <h4 className="main-title">Reports</h4>
          </Col>
        </Row>
        <Card>
          <DataTable
            title="Reports"
            data={reports}
            responsive
            className="react-dataTable"
            noHeader
            pagination
            paginationRowsPerPageOptions={paginationRowsPerPageOptions}
            columns={columns()}
            sortIcon={<ChevronDown />}
          />
        </Card>
      </Container>
    </div>
  );
};

export default Reports;
