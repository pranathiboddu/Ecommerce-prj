import { templateJitUrl, ThrowStmt } from '@angular/compiler';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { CartItem } from '../common/cart-item';

@Injectable({
  providedIn: 'root'
})
export class CartService {


  cartItems: CartItem[] = [];

  totalPrice: Subject<number> = new BehaviorSubject<number>(0);
  totalQuantity: Subject<number> = new BehaviorSubject<number>(0);

  storage: Storage = sessionStorage;

  constructor() {

    //read data from the storage
    let data = JSON.parse(this.storage.getItem('cartItems'));

    if(data != null)
    {
      this.cartItems = data;
    }
    //compute totals based on the dara that is read from storage
    this.computeCartTotals();
   }

  addToCart(theCartItem: CartItem) {
    //check if we have already item in our cart
    let alreadyExistsInCart: boolean = false;
    let existisingCartItem: CartItem = undefined;

    if (this.cartItems.length > 0) {

      //find the item in the cart based on item id

      // for (let tempCartItem of this.cartItems) {
      //   if (tempCartItem.id === theCartItem.id) {
      //     existisingCartItem = tempCartItem;
      //     break;
      //   }
      // }

      existisingCartItem = this.cartItems.find(tempCartItem => tempCartItem.id === theCartItem.id);

      //check if we found it

      alreadyExistsInCart = (existisingCartItem != undefined);

    }

    if (alreadyExistsInCart) {
      //increment the quantity
      existisingCartItem.quantity++;
    }
    else {
      //just add the item to the array
      this.cartItems.push(theCartItem);
    }

    //compute cart total price and quantity

    this.computeCartTotals();

  }
  computeCartTotals() {

    let totalPriceValue: number = 0;
    let totalQuantityValue: number = 0;

    for (let currentCartIem of this.cartItems) {
      totalPriceValue += currentCartIem.quantity * currentCartIem.unitPrice;
      totalQuantityValue += currentCartIem.quantity;
    }

    //publish the new values.. all subscribers will receive the new data

    this.totalPrice.next(totalPriceValue);
    this.totalQuantity.next(totalQuantityValue);

    //log cart data just for debugging purposes

    this.logCartData(totalPriceValue, totalQuantityValue);

    //persist cart data
    this.persistCartItems();
  }

  persistCartItems(){

    this.storage.setItem('cartItems', JSON.stringify(this.cartItems));

  }

  logCartData(totalPriceValue: number, totalQuantityValue: number) {

    console.log(`Contentes of the cart`);
    for (let tempCartItem of this.cartItems) {
      const subTotalPrice = tempCartItem.quantity * tempCartItem.unitPrice;
      console.log(`name: ${tempCartItem.name}, quantity=${tempCartItem.quantity}, unitPrice=${tempCartItem.unitPrice},subTotalPrice=${subTotalPrice}`);
    }
    console.log(`totalPrice: ${totalPriceValue.toFixed(2)}, totalQuantity: ${totalQuantityValue}`);

    console.log('---------------');
  }

  decrementQuantity(theCartItem: CartItem) {

    theCartItem.quantity--;

    if (theCartItem.quantity === 0) {
      this.remove(theCartItem);
    }
    else {
      this.computeCartTotals();
    }
  }

  remove(theCartItem: CartItem) {
    // get index of item in the array
    const itemIndex = this.cartItems.findIndex(tempCartItem => tempCartItem.id === theCartItem.id);

    //if found . remove the item from the arrat at the given index
    if (itemIndex > -1) {
      this.cartItems.splice(itemIndex, 1);

      this.computeCartTotals();
    }
  }
}
