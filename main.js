console.log('Welcome to YAAKTHAI');

const $btnShowCart = $('.cart-button');
const $btnCloseCart = $('.cart-close');
const $btnAddToCart = $('.order-button');

const $inputQuantity = $('input.quantity');
const $cartQuantityBadge = $('.cart-quantity');

const $totalPriceCartEle = $('.cart-total-top .text-18.bold');
const $cartListEle = $('.cart-list');

// Utils START //
function numberWithCommas(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function parseToNumber(str) {
  return +str || str;
}

function isEmpty(val) {
  return (
    val === undefined ||
    val === null ||
    (typeof val === 'object' && Object.keys(val).length === 0) ||
    (typeof val === 'string' && val.trim().length === 0)
  );
}

function sum(arr, key) {
  return arr.reduce((a, b) => +a + (key ? +b[key] : +b), 0);
}
// Utils END //

// Fetching CMS START//
function fetchProducts() {
  const parser = new DOMParser();
  return fetch('/ajax-product-collection')
    .then((response) => response.text())
    .then((html) => {
      const doc = parser.parseFromString(html, 'text/html');
      products = [...doc.querySelectorAll('.w-dyn-item')].map((ele) => {
        const productItem = [...ele.querySelectorAll('[data-prop]')].reduce(
          (prev, cur) => {
            const name = cur.dataset.prop;
            const value = cur.src || parseToNumber(cur.innerText) || null;
            return { ...prev, [name]: value };
          },
          {}
        );
        return productItem;
      });
    });
}

function getProductById(id) {
  const product = products.find((ele) => ele.id === id);
  return product || {};
}
// Fetching CMS END//

// Cart method START //
const defaultCartData = {
  totalAfterPrice: 0,
  totalQuantity: 0,
  data: [],
};

function getCart() {
  const cart = JSON.parse(localStorage.getItem('cart'));
  if (isEmpty(cart)) {
    localStorage.setItem('cart', JSON.stringify(defaultCartData));
    return defaultCartData;
  }
  return cart;
}

function setCart(data) {
  const totalQuantity = sum(data, 'quantity');
  const totalAfterPrice = sum(data, 'totalAfterPrice');
  const newCart = {
    totalQuantity,
    totalAfterPrice,
    data,
  };
  localStorage.setItem('cart', JSON.stringify(newCart));
}

function addItemToCart(id, quantity) {
  const cartData = getCart().data;
  const existCartItem = cartData.find((e) => e.id === id);
  if (existCartItem) {
    const newQuantity = existCartItem.quantity + quantity;
    existCartItem.quantity = newQuantity;
    existCartItem.totalAfterPrice = existCartItem.afterPrice * newQuantity;

    setCart(cartData);
    return;
  }
  const product = getProductById(id);
  const newCartItem = {
    ...product,
    quantity,
    totalAfterPrice: product.afterPrice * quantity,
  };
  const newCartData = [...cartData, newCartItem];
  setCart(newCartData);
}

function removeItemFromCart(id) {
  const cartData = getCart().data;
  const newCartData = cartData.filter((e) => e.id !== id);
  console.log(newCartData);
  setCart(newCartData);
}

function renderCartItem(cartData) {
  const { name, totalAfterPrice, image, id } = cartData;
  return `<div class="cart-item">
        <img
          src=${image}
          loading="lazy"
          alt=""
          class="cart-item-img"
        />
        <div class="cart-item-info">
          <div class="heading-3 bold">${name}</div>
          <div class="heading-3">${numberWithCommas(totalAfterPrice)} VND</div>
          <a href="#" class="cart-item-remove" data-id=${id}>Remove</a>
        </div>
      </div>`;
}

function renderCart() {
  const cart = getCart();
  const cartItemHtml = cart.data.map(renderCartItem);

  $totalPriceCartEle.text(`${numberWithCommas(cart.totalAfterPrice)} VND`);
  $cartQuantityBadge.text(cart.totalQuantity);
  $cartListEle.html(cartItemHtml.join(' '));

  $('.cart-item-remove').on('click', function (e) {
    e.preventDefault();
    const id = $(this).data('id');
    removeItemFromCart(id);
    renderCart();
  });
}
renderCart();
// Cart method END //

function handleCartVisible() {
  $btnShowCart.on('click', (e) => {
    e.preventDefault();
    $('.cart-wrap, .cart-container').addClass('show');
  });

  $btnCloseCart.on('click', (e) => {
    e.preventDefault();
    $('.cart-wrap, .cart-container').removeClass('show');
  });
}
handleCartVisible();

function handleAddToCart() {
  $btnAddToCart.on('click', function (e) {
    e.preventDefault();
    const quantity = $(this).closest('.add-to-cart').find($inputQuantity).val();
    const id = $(this).data('id');
    addItemToCart(id, +quantity);
    renderCart();
  });
}
handleAddToCart();

window.onload = () => {
  fetchProducts().then(() => {
    // Put your main code need products here
    console.log(products);
  });
};
