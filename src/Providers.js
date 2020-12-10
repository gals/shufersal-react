import {Product, OrderItem} from './Order.js';

class Provider {
}

export class Shufersal extends Provider {
    // Creates a list of order items out of a JSON blob that represents an order
    static fromJSON(data) {
        let items = [];
        data.entries.forEach(entry => {
            let totalPrice = entry.totalPrice.value;
            if (entry.priceAfterDiscount) {
                totalPrice = entry.priceAfterDiscount;
            }

            let price = totalPrice / entry.quantity;
            let product = new Product(
                entry.product.code,
                entry.product.name,
                price);
            
            items.push(new OrderItem(product, entry.quantity));
        });
        return items;
    }
}