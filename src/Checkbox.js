import React from 'react';

export class Checkbox extends React.Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(e) {
    if (this.props.onChange) {
      this.props.onChange(e);
    }
  }

  render() {
    return (
      <input className="form-check-input" type="checkbox" 
        checked={this.props.checked}
        disabled={this.props.disabled}
        onChange={this.handleChange} /> 
    )
  }
}