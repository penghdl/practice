import React from 'react';
import { ICellRendererParams } from 'ag-grid-community';
import { Button, Tooltip } from '@patternfly/react-core';

export default (props: ICellRendererParams) => {
//   const cellValue = props.valueFormatted ? props.valueFormatted : props.value;
  
  const cellValue = props.data['userInputs'];
  const buttonClicked = () => {
    // alert(cellValue.userInputs);
    alert(JSON.stringify(cellValue));
  };

  return (
    <div>
      {
        cellValue.length > 0 ? (
          <Tooltip id="listTooltip" position='bottom' content={
            <ul>
              {cellValue.map((item, index) => (
                  <li key={index}>
                  <strong>{item.key}:</strong> {item.value} (Type: {item.type})
                  </li>
              ))}
            </ul>}>
            <a data-tip="List Data" data-for="listTooltip">
              自定义属性
            </a>
          </Tooltip>):
          (           
             <a data-tip="List Data" data-for="listTooltip">
              无自定义属性
            </a>
          )
      }
      </div>
  );
};
