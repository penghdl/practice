import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button, FileUpload, Modal, PageSection, Split, SplitItem, Tab, TabTitleText, Tabs } from '@patternfly/react-core';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import * as XLSX from 'xlsx';
import { CellClassRules, ColDef, GridApi, ICellRendererParams, RowClassRules, ValueParserParams } from 'ag-grid-community';
import { RouteComponentProps } from 'react-router';
import './detail.css';

interface Props {
  orderId?: string;
}

const OrderDetailsPage: React.FC<RouteComponentProps<{ orderId?: string }>> = ({ ...props }) => {
  const [orderId] = useState<string>(props.match.params.orderId);
  const [gridApi, setGridApi] = useState<any[]>([]);
  const [columnDefsGroup, setColumnDefsGroup] = useState<ColDef[]>([]);
  const [agTabs, setAgTabs] = useState<any[]>([]);
  const [activeTabKey, setActiveTabKey] = React.useState<string | number>(0);
  const [activeModalTabKey, setActiveModalTabKey] = React.useState<string | number>(0);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [modalFilename, setModalFilename] = React.useState('');
  const [filename, setFilename] = React.useState('');
  const [refreshCounter, setRefreshCounter] = useState(0);
  const defaultColDef = useMemo<ColDef>(() => {
    return {
      editable: true,
      cellDataType: false,
      filter: true,
    };
  }, []);

  const aggregateColumnDefs = useCallback(() => {
    const allColumnDefs = gridApi.map((apiItem) => apiItem.columnDefs);
    setColumnDefsGroup(allColumnDefs);
  }, [gridApi]);

  useEffect(() => {
    aggregateColumnDefs();
  }, [aggregateColumnDefs]); 


  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
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
    setActiveTabKey(0);
    setIsModalOpen(true);
    setModalFilename(file.name);
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

  const rowClassRules = useMemo<RowClassRules>(() => {
    return {
      // row style function
      'sick-days-warning': (params) => {
        const numSickDays = params.data.OPEN_SEAT_ID;
        return numSickDays > 5155158;
      },
      // row style expression
      'sick-days-breach': 'data.OPEN_SEAT_ID <= 5155147',
    };
  }, []);
  
  const gridRef = useRef<AgGridReact>(null);
  const renderAgGrid = (rowData, columnDefs: ColDef[]) => {
    return (
      <div className={"ag-theme-quartz"} style={{ width: '100%', height: '600px' }}>
        <AgGridReact
          ref={gridRef}
          key={refreshCounter}
          rowData={rowData}
          columnDefs={columnDefs}
          rowSelection={'single'}
          defaultColDef={defaultColDef}
          enableCellChangeFlash={true}
          // rowClassRules={rowClassRules}
        />
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
    setFilename(modalFilename);
    setActiveTabKey(0);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };


  const handleClear = (_event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    setModalFilename('');
    setAgTabs([]);
  };

  const handleUploadButtonClick = () => {
    setModalFilename('');
    setAgTabs([]);
    setIsModalOpen(true);
  }

  const handleDownloadButtonClick = () => {
    if(gridApi.length=== 0 ) return;
    const workbook: XLSX.WorkBook = XLSX.utils.book_new();

    gridApi.forEach((tab, index) => {
      const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(tab.rowData);
      XLSX.utils.book_append_sheet(workbook, worksheet, tab.title);
    });

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'download.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const numberParser = (params: ValueParserParams) => {
    const newValue = params.newValue;
    let valueAsNumber;
    if (newValue === null || newValue === undefined || newValue === '') {
        valueAsNumber = null;
    } else {
        valueAsNumber = parseFloat(params.newValue);
    }
    return valueAsNumber;
  }

  const ragRenderer = (params: ICellRendererParams) => {
    return <span className="rag-element">{params.value}</span>;
  }
  
  const ragCellClassRules: CellClassRules = {
    'rag-green-outer': params => params.value === 2008,
    'rag-blue-outer': params => params.value === 2004,
    'rag-red-outer': params => params.value === 5155167,
  };

  const setCellStyle = () => {
    const columnIndex = 0; // Replace with the correct index

    // Make a shallow copy of gridApis array
    const updatedGridApis = [...gridApi];
  
    // Modify the columnDefs for the specified gridApi
    const fieldColumnIndex = updatedGridApis[columnIndex]?.columnDefs?.findIndex(column => column.field === 'REGION');
  
    if (fieldColumnIndex !== -1) {
      updatedGridApis[columnIndex].columnDefs[fieldColumnIndex] = {
        ...updatedGridApis[columnIndex].columnDefs[fieldColumnIndex],
        cellClass: 'rag-blue',
        // valueParser: numberParser,
        // cellRenderer: ragRenderer,
      };
    }

      // Modify the columnDefs for the specified gridApi
      const secondColumnIndex = updatedGridApis[columnIndex]?.columnDefs?.findIndex(column => column.field === 'OPEN_SEAT_ID');

      if (fieldColumnIndex !== -1) {
        updatedGridApis[columnIndex].columnDefs[secondColumnIndex] = {
          ...updatedGridApis[columnIndex].columnDefs[secondColumnIndex],
          valueParser: numberParser,
          cellRenderer: ragRenderer,
          cellClassRules: ragCellClassRules,
        };
      }
  
    // Update the state with the modified gridApis
    setGridApi(updatedGridApis);
    console.log(gridApi[0].columnDefs);
    // const params = {
    //   force: true,
    //   suppressFlash: true,
    // };
    // gridRef.current!.api.refreshCells(params);
    setRefreshCounter((prevCounter) => prevCounter + 1);
  }

  return (
    <React.Fragment>
      <PageSection>
      <Split>
        <SplitItem>
          <Button variant="primary" onClick={handleUploadButtonClick} style={{ marginBottom: '8px' }}>
            上传Excel文件
          </Button>
          <Button variant="primary" onClick={handleDownloadButtonClick} style={{ marginBottom: '8px', marginLeft: '20px', marginRight: '10px'}}>
            下载Excel文件
          </Button>
          {filename}
        </SplitItem>
        <SplitItem isFilled></SplitItem>
        <SplitItem>
          <Button variant="primary" style={{ marginBottom: '8px', marginLeft: '20px' }}>
            对比数据
          </Button>
          <Button variant="primary" onClick={setCellStyle} style={{ marginBottom: '8px', marginLeft: '20px' }}>
            校验金额
          </Button>
          <Button variant="primary" style={{ marginBottom: '8px', marginLeft: '20px' }}>
            翻译地址
          </Button>
          <Button variant="primary" style={{ marginBottom: '8px', marginLeft: '20px' }}>
            校验地址
          </Button>
        </SplitItem>
      </Split>
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
          title="上传Excel文件"
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
          <FileUpload
            id="text-file-simple"
            filename={modalFilename}
            filenamePlaceholder="Drag and drop a file or upload one"
            onFileInputChange={onFileChange}
            onClearClick={handleClear}
            browseButtonText="Upload"
          />
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
