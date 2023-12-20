import React, { useCallback, useRef, useState } from 'react';
import { AgGridReact } from 'ag-grid-react'; // React Grid Logic
import "ag-grid-community/styles/ag-grid.css"; // Core CSS
import "ag-grid-community/styles/ag-theme-quartz.css"; // Theme
import { ColDef } from 'ag-grid-community';

import {
  PageSection,
  Button,
} from '@patternfly/react-core';
import '../../styles.css';
import TotalValueRenderer from './TotalValueRenderer';
import CreateFormModal from './CreateFormModal';
import EditFormModal from './EditFormModal'; // Adjust the path as needed
import { Link, useHistory } from 'react-router-dom';


interface IRow {
    order: string;
    owner: string;
    count: string;
    userInputs: {
      key: string;
      value: string;
      type: string;
    }[];
}

const OrderPage: React.FC = () => {

  const gridRef = useRef<AgGridReact<IRow>>(null);

  // Row Data: The data to be displayed.
  const [rowData, setRowData] = useState<IRow[]>([
    { order: "order1", owner: "Tim", count: '10', userInputs: [{"key":"address", "value":"dalian", "type":"striong"},{"key":"price", "value":"100", "type":"number"}] },
    { order: "order2", owner: "NASA", count: '12', userInputs: [{"key":"address1", "value":"dalian", "type":"striong"},{"key":"price", "value":"100", "type":"number"},{"key":"address2", "value":"dalian", "type":"striong"},{"key":"address3", "value":"dalian", "type":"striong"}]},
    { order: "order3", owner: "SpaceX", count: '100', userInputs: [] }
  ]);
  
  // Column Definitions: Defines & controls grid columns.
  const [colDefs, setColDefs] = useState<ColDef<IRow>[]>([
    { field: "order" },
    { field: "owner" },
    { field: "count" },
    { field: "order" },
    { field: "owner" },
    { field: "count" },
    { field: "userInputs", minWidth: 190, cellRenderer: TotalValueRenderer },
  ]);

  const initValue = {
    order: '',
    owner: '',
    count: '',
    userInputs: [],
  }

  const history = useHistory();

  const [formData, setFormData] = useState(initValue);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [selectedRow, setSelectedRow] = useState<IRow | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  // Function to handle the "Edit" button click
  const handleEditButtonClick = () => {
    setIsEditModalOpen(true);
  };

  const handleInputChange = (value: string, inputType: string) => {
    setFormData({
      ...formData,
      [inputType]: value,
    });
  };

  const handleEditInputChange = (value: string, inputType: string) => {
    setSelectedRow({
      ...selectedRow,
      [inputType]: value,
    });
  };

  const handleUserInputAdd = () => {
    const newUserInput = {
      key: '',
      value: '',
      type: 'string',
    };
    setFormData({
      ...formData,
      userInputs: [...formData.userInputs, newUserInput],
    });
  };

  const handleEditUserInputAdd = () => {
    const newUserInput = {
      key: '',
      value: '',
      type: 'string',
    };
    setSelectedRow({
      ...selectedRow,
      userInputs: [...selectedRow.userInputs, newUserInput],
    });
  };

  const handleUserInputRemove = (index: number) => {
    const updatedUserInputs = [...formData.userInputs];
    updatedUserInputs.splice(index, 1);
    setFormData({
      ...formData,
      userInputs: updatedUserInputs,
    });
  };

  const handleEditUserInputRemove = (index: number) => {
    const updatedUserInputs = [...selectedRow.userInputs];
    updatedUserInputs.splice(index, 1);
    setSelectedRow({
      ...selectedRow,
      userInputs: updatedUserInputs,
    });
  };

  const handleUserInputChange = (value: string, inputType: string, index: number) => {
    const updatedUserInputs = [...formData.userInputs];
    updatedUserInputs[index] = {
      ...updatedUserInputs[index],
      [inputType]: value,
    };
    setFormData({
      ...formData,
      userInputs: updatedUserInputs,
    });
  };

  const handleEditUserInputChange = (value: string, inputType: string, index: number) => {
    const updatedUserInputs = [...selectedRow.userInputs];
    updatedUserInputs[index] = {
      ...updatedUserInputs[index],
      [inputType]: value,
    };
    setSelectedRow({
      ...selectedRow,
      userInputs: updatedUserInputs,
    });
  };

  const handleCreateButtonClick = () => {
    setFormData(initValue);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedRow(null);
  };

  const handleResetModal = () => {
    setFormData(initValue);
  };

  const handleResetEditModal = () => {
    setFormData(rowData[0]);
  };

  const handleSubmitForm = () => {
    setIsModalOpen(false);
    console.log(formData)
    const newRow: IRow = {
        order: formData.order,
        owner: formData.owner,
        count: formData.count,
        userInputs: formData.userInputs,
    }
    setRowData((prevData) => [...prevData, newRow]);
  };

  const handleSumitEditForm = () => {
    setIsEditModalOpen(false);
    const rowIndex = rowData.findIndex(row => row.order === selectedRow.order);
    if (rowIndex !== -1) {
      const updatedData = [...rowData];
      updatedData[rowIndex] = selectedRow;  
      setRowData(updatedData);
    }

  };

  const onSelectionChanged = useCallback(() => {
    const selectedRows = gridRef.current!.api.getSelectedRows();
    setSelectedRow(selectedRows[0]);
  }, []);

  const onRowDoubleClicked = (event) => {
    const selectedRowData = event.data; // 获取双击的行的数据
    const targetUrl = `/OrderDetails/${selectedRowData.order}`; // 根据数据生成目标URL

    history.push(targetUrl); // 使用路由导航跳转到目标页面
  };

  return (
    <React.Fragment>
      <PageSection>
        <Button variant="primary" onClick={handleCreateButtonClick} style={{ marginBottom: '8px' }}>
          创建
        </Button>
        <Button variant="primary" onClick={handleEditButtonClick} style={{ marginLeft:'20px',marginBottom: '8px' }}>
          编辑
        </Button>
        { selectedRow && selectedRow.order !== null ? (
            <Link to={`/OrderDetails/${selectedRow.order}`}>
                <Button variant="primary" style={{ marginLeft: '20px', marginBottom: '8px' }}>
                    查看包裹
                </Button>
            </Link>
            ) : null}

        <div className={"ag-theme-quartz"} style={{ width: '100%', height: '100%' }}>
            <AgGridReact<IRow>
                ref={gridRef}
                rowData={rowData}
                columnDefs={colDefs}
                rowSelection={'single'}
                onSelectionChanged={onSelectionChanged}
                onRowDoubleClicked={onRowDoubleClicked}
            />
        </div>
        <CreateFormModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          formData={formData}
          handleInputChange={handleInputChange}
          handleUserInputChange={handleUserInputChange}
          handleUserInputAdd={handleUserInputAdd}
          handleUserInputRemove={handleUserInputRemove}
          handleResetModal={handleResetModal}
          handleSubmitForm={handleSubmitForm}
        />
        <EditFormModal
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          formData={selectedRow}
          handleEditInputChange={handleEditInputChange}
          handleEditUserInputChange={handleEditUserInputChange}
          handleEditUserInputAdd={handleEditUserInputAdd}
          handleEditUserInputRemove={handleEditUserInputRemove}
          handleResetEditModal={handleResetEditModal}
          handleUpdateForm={handleSumitEditForm} // Add this function
        />
      </PageSection>
    </React.Fragment>
  );
};

export default OrderPage;
