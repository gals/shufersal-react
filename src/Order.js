import React from 'react';
import {Checkbox} from './Checkbox';

export class OrderSummary extends React.Component {
  constructor(props) {
    super(props);
    this.state = this.defaultState();
  }

  defaultState() {
    return {
      discount: '',
      discountFn: (total) => total
    };
  }

  handleDiscountChange(discount) {
    if (discount === '') {
      return this.setState(this.defaultState());
    };
 
    if (discount.includes('%')) {
      let n = parseInt(discount.split('%')[0]);
      if (isNaN(n)) {
        return;
      }

      return this.setState({
        discount: discount,
        discountFn: (total) => Math.max(0, total - ((n / 100) * total))
      });
    }
  
    let n = parseInt(discount);
    if (isNaN(n)) {
      return;
    }

    this.setState({
      discount: discount,
      discountFn: (total) => Math.max(0, total - n),
    });
  }

  render() {
    const discountTotal = this.state.discountFn(this.props.total);

    let splitTotal = 0;
    Object.values(this.props.people).forEach(p => {
      splitTotal += p.amount;
    });
    const leftToSplit = discountTotal - splitTotal;

    const peopleCount = Object.keys(this.props.people).length;
    const discountDiff = this.props.total - discountTotal;
    const discountShare = discountDiff / peopleCount;
    const calculatePersonDiscount = (total) => Math.max(0, total - discountShare);

    return (
      <table className="table">
        <thead>
        </thead>
        <tbody>
          <tr>
            <td><b>סה״כ</b></td>
            <td>{ this.props.total.toFixed(2) } ש״ח</td>
          </tr>
          <tr>
            <td><b>הנחה</b></td>
            <td>
              <form>
                <div className="form-group">
                  <input type="text" className="form-control" 
                    value={this.state.discount}
                    placeholder="הזן הנחה באחוזים (למשל: 5%) או בשקלים"
                    onChange={(e) => this.handleDiscountChange(e.target.value)} />
                  <small className="form-text text-muted">ההנחה תחולק שווה בשווה בין השותפים</small>
                </div>
              </form>
            </td>
          </tr>
          <tr>
            <td><b>שולם</b></td>
            <td>
              { discountTotal.toFixed(2) } ש״ח
              { leftToSplit > 0 && 
                <small className="form-text text-muted">נשאר לחלק: { leftToSplit.toFixed(2) }</small>
              }
            </td>
          </tr>
          {this.props.people.map((p, i) => {
            return (
              <tr key={i}>
                <td>{ p.name }</td>
                <td>{ calculatePersonDiscount(p.amount).toFixed(2) } ש״ח</td>
              </tr>
            )})
          }
        </tbody>
      </table>
    );    
  }
}

export class OrderTable extends React.Component {
  render() {
    const people = this.props.people;
    const items = this.props.items;

    return (
      <table className="table">
        <thead>
          <tr>
              <th scope="col">שם המוצר</th>
              {people.map((p, i) => {
                return (
                  <th scope="col" key={i}>{ p.name }</th>
                )
              })}
              <th scope="col">כמות (סופקה)</th>
              <th scope="col" className="text-left">מחיר ליחידה</th>
              <th scope="col" className="text-left">סה״כ</th>
          </tr>
        </thead>
        <tbody>
            {items.map((item, i) => {
              return (
                <OrderTableRow key={i}
                  item={item}
                  itemIndex={i}
                  people={people}
                  onPersonChecked={this.props.onPersonChecked}
                  onQuantityChanged={this.props.onQuantityChanged}></OrderTableRow>
              )
            })}
        </tbody>
      </table>
    );
  }
}

export class OrderTableRow extends React.Component {
  constructor(props) {
    super(props);

    this.handlePersonChecked = this.handlePersonChecked.bind(this);
    this.handleQuantityChanged = this.handleQuantityChanged.bind(this);
  }

  handlePersonChecked(itemIndex, personIndex) {
    this.props.onPersonChecked(itemIndex, personIndex);
  }

  handleQuantityChanged(itemIndex, quantity) {
    this.props.onQuantityChanged(itemIndex, quantity);
  }

  render() {
    const item = this.props.item;
    const itemIndex = this.props.itemIndex;
    const people = this.props.people;

    return (
      <tr>
        <td>{ item.product.name }</td>
        {
          people.map((p, i) => {
            return (
              <td key={i}>
                <div className="form-check">
                  <Checkbox
                    checked={item.personHasShares(p.name)}
                    disabled={item.quantity === 0}
                    onChange={() => this.handlePersonChecked(itemIndex, i)}></Checkbox>
                </div>
              </td>
            )
          })
        }
        <td>
          <form>
            <div className="form-row">
              <div className="col-8">
                <input type="text" className="form-control" 
                  value={item.quantity}
                  onChange={(e) => this.handleQuantityChanged(itemIndex, e.target.value)}/>
                {item.quantity < item.orderedQuantity &&
                  <small className="form-text text-muted">הוזמן: {item.orderedQuantity}</small>
                }
              </div>
              <div className="col">
                <button type="button" className="btn btn-link btn-sm">לחלק</button>
              </div>
            </div>
          </form>
        </td>
        <td className="text-left">{ item.product.price.toFixed(2) }</td>
        <td className="text-left">{ item.total().toFixed(2) }</td>
      </tr>
    )
  }
}

export class Product {
    constructor(id, name, price) {
        this.id = id;
        this.name = name;
        this.price = price;
    }
}

export class OrderItem {
  constructor(product, orderedQuantity, quantity, shares = {}) {
    this.product = product;
    this.orderedQuantity = orderedQuantity;
    if (quantity === undefined) {
      quantity = orderedQuantity;
    }
    this.quantity = quantity;
    this.shares = shares;
  }

  personHasShares(name) {
    return Boolean(this.shares[name] && this.shares[name] > 0);
  }

  total() {
    return this.product.price * this.quantity;
  }

  sharesCount() {
    let count = 0;
    Object.values(this.shares).forEach(n => {
      count += n;
    });
    return count;
  }

  sharePrice() {
    return this.total() / Math.max(1, this.sharesCount());
  }
}