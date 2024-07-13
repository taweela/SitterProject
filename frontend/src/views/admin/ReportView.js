/* eslint-disable no-unused-vars */
import { useParams } from 'react-router-dom';
import { useGetReportQuery } from '../../redux/api/reportAPI';
import { useEffect } from 'react';
import { Card, CardBody, Col, Container, Row } from 'reactstrap';
import SpinnerComponent from '../../components/SpinnerComponent';
import { getDateFormat } from '../../utils/Utils';

const ReportView = () => {
  const { id } = useParams();
  const { data: report, isLoading, refetch } = useGetReportQuery(id);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return (
    <>
      {isLoading ? (
        <SpinnerComponent />
      ) : (
        <div className="main-view">
          <Container>
            <Row className="justify-content-center mt-5">
              <Col lg="10" md="12">
                <Card className="report-card shadow-sm">
                  <CardBody>
                    <Row>
                      <Col className="mb-4" lg="8">
                        <h2 className="mb-3 text-primary">Report Details</h2>
                        <div className="card-text mb-3">
                          <span className="text-muted" style={{ fontSize: '16px', fontWeight: 'bold' }}>
                            Title:{' '}
                          </span>
                          <span className="text-dark ml-2">{report.title}</span>
                        </div>
                        <div className="card-text mb-3">
                          <span className="text-muted" style={{ fontSize: '16px', fontWeight: 'bold' }}>
                            Order Number:{' '}
                          </span>
                          <span className="text-dark ml-2">{report.order?.orderNumber}</span>
                        </div>
                        <div className="d-flex align-items-center mb-3">
                          <span className="text-muted" style={{ fontSize: '16px', fontWeight: 'bold' }}>
                            Requested Time:{' '}
                          </span>
                          <span className="ml-2">{getDateFormat(report.createdAt)}</span>
                        </div>
                        <div className="card-text mb-3">
                          <span className="text-muted" style={{ fontSize: '16px', fontWeight: 'bold' }}>
                            Reporter:{' '}
                          </span>
                          <span className="text-dark ml-2">
                            {report.reportor?.firstName} {report.reportor?.lastName}
                          </span>
                        </div>
                        <div className="card-text mb-3">
                          <span className="text-muted" style={{ fontSize: '16px', fontWeight: 'bold' }}>
                            Reporter Role:
                          </span>
                          <span className="text-dark ml-2">{report.reportor?.role}</span>
                        </div>
                        <div className="card-text mb-3">
                          <span className="text-muted" style={{ fontSize: '16px', fontWeight: 'bold' }}>
                            Description:
                          </span>
                          <p className="text-dark mt-1 ml-2">{report.description}</p>
                        </div>
                      </Col>
                    </Row>
                  </CardBody>
                </Card>
              </Col>
            </Row>
          </Container>
        </div>
      )}
    </>
  );
};

export default ReportView;
