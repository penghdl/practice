import React, { useState } from 'react';
import { AgGridReact } from 'ag-grid-react'; // React Grid Logic
import "ag-grid-community/styles/ag-grid.css"; // Core CSS
import "ag-grid-community/styles/ag-theme-quartz.css"; // Theme
import { ColDef } from 'ag-grid-community';

import {
  PageSection,
  Form,
  FormGroup,
  TextInput,
  Button,
  Modal,
  ModalVariant,
  ModalBoxBody,
  ModalBoxFooter,
  FormSelect,
  FormSelectOption,
} from '@patternfly/react-core';
import '../../styles.css';

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

const TestPage: React.FC = () => {

  // Row Data: The data to be displayed.
  const [rowData, setRowData] = useState<IRow[]>([
    { order: "Voyager", owner: "Tim", count: '10', userInputs: [] },
    { order: "Apollo 13", owner: "NASA", count: '12', userInputs: []},
    { order: "Falcon 9", owner: "SpaceX", count: '100', userInputs: [] }
  ]);
  
  // Column Definitions: Defines & controls grid columns.
  const [colDefs, setColDefs] = useState<ColDef<IRow>[]>([
    { field: "order" },
    { field: "owner" },
    { field: "count" },
    { field: "userInputs"},
  ]);

  const initValue = {
    order: '',
    owner: '',
    count: '',
    userInputs: [],
  }

  const [formData, setFormData] = useState(initValue);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleInputChange = (value: string, inputType: string) => {
    setFormData({
      ...formData,
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

  const handleUserInputRemove = (index: number) => {
    const updatedUserInputs = [...formData.userInputs];
    updatedUserInputs.splice(index, 1);
    setFormData({
      ...formData,
      userInputs: updatedUserInputs,
    });
  };

  const handleUserInputChange = (value: string, inputType: string, index: number) => {
    console.log(`Received input value: ${value}`);
    console.log(`Input type: ${inputType}`);
    console.log(`Index: ${index}`);
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

  const handleCreateButtonClick = () => {
    setFormData(initValue);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleResetModal = () => {
    setFormData(initValue);
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

  return (
    <React.Fragment>
      <PageSection>
        <Button variant="primary" onClick={handleCreateButtonClick} style={{ marginBottom: '8px' }}>
          Create
        </Button>
        <div className={"ag-theme-quartz"} style={{ width: '100%', height: '100%' }}>
            <AgGridReact 
                rowData={rowData}
                columnDefs={colDefs}
            />
        </div>
        <Modal
          variant={ModalVariant.small}
          title="Create Form"
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        >
            <ModalBoxBody>
              <Form>
                <FormGroup label="Order" isRequired fieldId="order">
                    <TextInput
                    type="text"
                    id="order"
                    name="order"
                    value={formData.order}
                    onChange={(value) => handleInputChange(value, 'order')}
                    />
                </FormGroup>
                <FormGroup label="Owner" isRequired fieldId="owner">
                    <TextInput
                    type="text"
                    id="owner"
                    name="owner"
                    value={formData.owner}
                    onChange={(value) => handleInputChange(value, 'owner')}
                    />
                </FormGroup>
                <FormGroup label="Count" isRequired fieldId="count">
                    <TextInput
                    type="text"
                    id="count"
                    name="count"
                    value={formData.count}
                    onChange={(value) => handleInputChange(value, 'count')}
                    />
                </FormGroup>

                {formData.userInputs.map((userInput, index) => (
                    <FormGroup key={index} label={'User defined propertity:'}>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                            <label htmlFor={`key-${index}`} style={{ width: '120px', marginRight: '8px' }}>
                                Key:
                            </label>
                            <TextInput
                                type="text"
                                id={`key-${index}`}
                                name={`key-${index}`}
                                aria-label="Key"
                                value={userInput.key}
                                onChange={(value) => handleUserInputChange(value, 'key', index)}
                                style={{ flex: '1' }}
                            />
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                            <label htmlFor={`value-${index}`} style={{ width: '120px', marginRight: '8px' }}>
                                Value:
                            </label>
                            <TextInput
                                type="text"
                                id={`value-${index}`}
                                name={`value-${index}`}
                                aria-label="Value"
                                value={userInput.value}
                                onChange={(value) => handleUserInputChange(value, 'value', index)}
                                style={{ flex: '1' }}
                            />
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                            <label htmlFor={`type-${index}`} style={{ width: '120px', marginRight: '8px' }}>
                                Type:
                            </label>
                            <FormSelect
                                id={`type-${index}`}
                                name={`type-${index}`}
                                label="Type"
                                value={userInput.type}
                                onChange={(selection, event) =>
                                    handleUserInputChange(selection.toString(), 'type', index)
                                }
                                style={{ flex: '1' }}
                            >
                                <FormSelectOption key="string" value="string" label="String" />
                                <FormSelectOption key="number" value="number" label="Number" />
                            </FormSelect>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <Button variant="link" onClick={() => handleUserInputRemove(index)}>
                                Remove
                            </Button>
                        </div>
                    </FormGroup>
                ))}

                <Button variant="primary" onClick={handleUserInputAdd}>
                    Add User Defined Property
                </Button>
              </Form>
            </ModalBoxBody>
            <ModalBoxFooter>
                <Button variant="secondary" onClick={handleResetModal}>
                    Reset
                </Button>
                <Button variant="secondary" onClick={handleCloseModal}>
                    Cancel
                </Button>
                <Button variant="primary" onClick={handleSubmitForm}>
                    Submit
                </Button>
            </ModalBoxFooter>
        </Modal>
      </PageSection>
    </React.Fragment>
  );
};

export default TestPage;
