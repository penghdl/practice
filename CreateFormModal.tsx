import React from 'react';
import {
  Modal,
  ModalVariant,
  ModalBoxBody,
  ModalBoxFooter,
  Form,
  FormGroup,
  TextInput,
  Button,
  FormSelect,
  FormSelectOption,
} from '@patternfly/react-core';

interface CreateFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: {
    order: string;
    owner: string;
    count: string;
    userInputs: {
      key: string;
      value: string;
      type: string;
    }[];
  };
  handleInputChange: (value: string, inputType: string) => void;
  handleUserInputChange: (value: string, inputType: string, index: number) => void;
  handleUserInputAdd: () => void;
  handleUserInputRemove: (index: number) => void;
  handleResetModal: () => void;
  handleSubmitForm: () => void;
}

const CreateFormModal: React.FC<CreateFormModalProps> = ({
  isOpen,
  onClose,
  formData,
  handleInputChange,
  handleUserInputChange,
  handleUserInputAdd,
  handleUserInputRemove,
  handleResetModal,
  handleSubmitForm,
}) => {
  return (
    <Modal
      variant={ModalVariant.small}
      title="Create Form"
      isOpen={isOpen}
      onClose={onClose}
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
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSubmitForm}>
          Submit
        </Button>
      </ModalBoxFooter>
    </Modal>
  );
};

export default CreateFormModal;
