import React, { useState } from 'react';
import { Button, Modal, PageSection, Tab, TabTitleText, Tabs } from '@patternfly/react-core';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import * as XLSX from 'xlsx';
import { ColDef } from 'ag-grid-community';
import { RouteComponentProps } from 'react-router';

interface Props {
  orderId?: string;
}

const OrderDetailsPage: React.FC<RouteComponentProps<{ orderId?: string }>> = ({ ...props }) => {
  const [orderId] = useState<string>(props.match.params.orderId);
  const [gridApi, setGridApi] = useState<any[]>([]);
  const [agTabs, setAgTabs] = useState<any[]>([]);
  const [fileKey, setFileKey] = useState<number>(0);
  const [activeTabKey, setActiveTabKey] = React.useState<string | number>(0);
  const [activeModalTabKey, setActiveModalTabKey] = React.useState<string | number>(0);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      setFileKey((prevKey) => prevKey + 1);
      const reader = new FileReader();

      reader.onload = (e: any) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        const newAgTabs = workbook.SheetNames.map(sheetName => {
          const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
          const columnDefs = Object.keys(jsonData[0]).map(header => ({
            headerName: header,
            field: header,
          }));

          return {
            title: sheetName,
            columnDefs,
            rowData: jsonData,
          };
        });
        setAgTabs(newAgTabs);
      };

      reader.readAsArrayBuffer(file);
    }
    setIsModalOpen(true);
  };

  const handleTabClick = (
    event: React.MouseEvent<any> | React.KeyboardEvent | MouseEvent,
    tabIndex: string | number
  ) => {
    setActiveTabKey(tabIndex);
  };

  const handleModalTabClick = (
    event: React.MouseEvent<any> | React.KeyboardEvent | MouseEvent,
    tabIndex: string | number
  ) => {
    setActiveModalTabKey(tabIndex);
  };

  const renderAgGrid = (rowData, columnDefs: ColDef[]) => {
    return (
      <div className={"ag-theme-quartz"} style={{ width: '100%', height: '600px' }}>
        <AgGridReact rowData={rowData} columnDefs={columnDefs} rowSelection={'single'} />
      </div>
    );
  };

  const renderTab = (index: number, gridData) => {
    const tab = gridData[index];

    if (tab) {
      return (
        <Tab key={index} eventKey={index} title={<TabTitleText>{tab.title}</TabTitleText>}>
          {renderAgGrid(tab.rowData, tab.columnDefs)}
        </Tab>
      );
    }

    return null;
  };

  const renderTabs = (gridData) => {
    return gridData.map((_, index) => renderTab(index, gridData));
  };

  const handleModalToggle = (_event: KeyboardEvent | React.MouseEvent) => {
    setIsModalOpen(!isModalOpen);
  };

  const handleModalConfirm = () => {
    setIsModalOpen(false);
    setGridApi(agTabs);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <React.Fragment>
      <PageSection>
        <input key={fileKey} type="file" onChange={onFileChange} />
        { gridApi.length? (
            <Tabs
              activeKey={activeTabKey}
              onSelect={handleTabClick}
              aria-label="Tabs in the default example"
              role="region"
            >
              {renderTabs(gridApi)}
            </Tabs>):(<></>)
        }

        <Modal
          width="90%"
          title="Custom width modal"
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          actions={[
            <Button key="confirm" variant="primary" onClick={handleModalConfirm}>
              Confirm
            </Button>,
            <Button key="cancel" variant="link" onClick={handleModalToggle}>
              Cancel
            </Button>
          ]}
        >
          { agTabs.length? (
            <Tabs
              activeKey={activeModalTabKey}
              onSelect={handleModalTabClick}
              aria-label="Tabs in the default example"
              role="region"
            >
              {renderTabs(agTabs)}
            </Tabs>):(<></>)
          }
        </Modal>
      </PageSection>
    </React.Fragment>
  );
};

export default OrderDetailsPage;
