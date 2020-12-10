import './App.css';

import React from 'react';
import {Person} from './Person';
import {Shufersal} from './Providers';
import { OrderItem, OrderSummary, OrderTable } from './Order';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // TODO: Enable adding people using a form, and store it in the local storage
      people: [
        new Person('עידו'),
        new Person('רועי'),
        new Person('גל')
      ],
      orderItems: [],
      total: 0
    };

    this.handlePersonChecked = this.handlePersonChecked.bind(this);
    this.handleQuantityChanged = this.handleQuantityChanged.bind(this);
  }

  loadReceiptFile(f) {
    let reader = new FileReader();
    reader.onload = e => {
      let orderItems = Shufersal.fromJSON(JSON.parse(e.target.result));

      let total = 0;
      orderItems.forEach((item, i) => {
        total += item.total();
      });
  
      this.setState({
        orderItems: orderItems,
        total: total
      });
    };
    reader.readAsText(f);
  }

  handlePersonChecked(itemIndex, personIndex) {
    this.setState(state => {
      const person = state.people[personIndex];
      const item = state.orderItems[itemIndex];

      let newShares = Object.assign({}, item.shares);
      // toggle
      newShares[person.name] = (item.shares[person.name] || 0) === 0 ? 1 : 0;

      let newOrderItems = state.orderItems.slice();
      let newItem = new OrderItem(
        item.product,
        item.orderedQuantity,
        item.quantity,
        newShares
      );
      newOrderItems[itemIndex] = newItem;

      return {
        orderItems: newOrderItems,
        people: calculatePeople(state.people, newOrderItems)
      };
    });
  }

  handleQuantityChanged(itemIndex, quantity) {
    this.setState(state => {
      const item = state.orderItems[itemIndex];

      let q = parseInt(quantity);
      if (isNaN(q) || q >= item.orderedQuantity) {
        // Fallback to the original quantity when text is deleted,
        // or when the supplied quantity exceeds the ordered quantity
        q = item.orderedQuantity;
      }
      
      let newOrderItems = state.orderItems.slice();
      let newItem = new OrderItem(
        item.product,
        item.orderedQuantity,
        q,
        (q > 0) ? item.shares : {}
      );
      newOrderItems[itemIndex] = newItem;
  
      return {
        orderItems: newOrderItems,
        total: calculateTotal(newOrderItems),
        people: calculatePeople(state.people, newOrderItems)
      };
    });
  }

  render() {
    return (
      <div className="App">
        <div className="container">
          <h2>הזמנה</h2>
          <form>
            <div className="form-group">
              <label htmlFor="receiptFile">בחר קובץ קבלה</label>
              <input type="file" className="form-control-file" 
                onChange={(e) => this.loadReceiptFile(e.target.files[0])} />
            </div>
          </form>

          {this.state.orderItems.length > 0 &&
            <div>
              <OrderTable 
                items={this.state.orderItems}
                people={this.state.people}
                onPersonChecked={this.handlePersonChecked}
                onQuantityChanged={this.handleQuantityChanged}></OrderTable>

              <h2>סיכום הזמנה</h2>
              <OrderSummary
                total={this.state.total}
                people={this.state.people}></OrderSummary>
            </div>
          }
        </div>
      </div>
    );
  }
}

export default App;

function calculateTotal(orderItems) {
  let total = 0;
  orderItems.forEach(item => {
    total += item.total();
  });
  return total;
}

function calculatePeople(people, orderItems) {
  let newPeople = [];
  people.forEach(p => {
    let total = 0;
    orderItems.forEach(item => {
      let shares = item.shares[p.name] || 0;
      total += item.sharePrice() * shares;
    });
    newPeople.push(new Person(p.name, total));
  });
  return newPeople;
}