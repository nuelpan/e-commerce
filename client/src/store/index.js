import Vue from 'vue'
import Vuex from 'vuex'
import axios from '../../config/server'
import Swal from 'sweetalert2'

Vue.use(Vuex)
export default new Vuex.Store({
  state: {
    products: [],
    cart: [],
    currentUser: {},
    totalPrice: 0,
    isLogin: false
  },
  mutations: {
    GET_PRODUCTS (state, payload) {
      state.products = payload
    },
    GET_CART (state, payload) {
      state.cart = payload.data
      state.totalPrice = payload.totalPrice
    },
    CHANGE_ISLOGIN (state) {
      state.isLogin = true
    },
    LOGOUT (state) {
      state.isLogin = false
      localStorage.clear()
      state.cart = []
    }
  },
  actions: {
    getProducts (context) {
      axios({
        url: '/products',
        method: 'GET'
      })
        .then(({ data }) => {
          context.commit('GET_PRODUCTS', data)
        })  
    },
    getCart (context) {
      axios({
        url: '/carts',
        method: 'GET',
        headers: {
          access_token: localStorage.getItem('access_token')
        }
      })
        .then(({ data }) => {
          let totalPrice = 0;
          data.forEach(item => {
            totalPrice += item.productId.price
          });
          context.commit('GET_CART', {data, totalPrice})
        })
        .catch(console.log)
    },
    LoginUser (context, payload) {
      axios({
        method: 'POST',
        url: '/users/login',
        data: {
          email: payload.email,
          password: payload.password
        }
      })
        .then(({ data }) => {
          localStorage.setItem('access_token', data.access_token)
          context.commit('CHANGE_ISLOGIN')
          context.dispatch('getCart')
        })
        .catch(error => {
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: error.response.data.message
          })
        })
    },
    RegisterUser (context, payload) {
      axios({
        method: 'POST',
        url: '/users/register',
        data: {
          name: payload.name,
          email: payload.email,
          password: payload.password
        }
      })
        .then(({ data }) => {
          localStorage.setItem('access_token', data.token)
          context.commit('CHANGE_ISLOGIN')
          context.dispatch('getCart')
        })
        .catch(error => {
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: error.response.data.message
          })
        })
    },
    logout (context) {
      context.commit('LOGOUT')
    },
    checkLogin (context) {
      if (localStorage.getItem('access_token')) {
        context.commit('CHANGE_ISLOGIN')
      }
    },
    addToCart (context, payload) {
      axios({
        method: 'POST',
        url: `/carts/${payload}`,
        data: {
          productId: payload,
          // stock: payload.stock
        },
        headers: {
          access_token: localStorage.getItem('access_token')
        }
      })
        .then(({ data }) => {
          context.dispatch('getCart')
          Swal.fire(
            'Added To Cart!',
            'Your item has been added to cart.',
            'success'
          )
        })
        .catch(error => {
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: error.response.data.message
          })
        })
    },
    removeItemFromCart(context, payload) {
      axios({
        method: 'DELETE',
        url: `/carts/${payload}`,
        headers: {
          access_token: localStorage.getItem('access_token')
        }
      })
        .then(({ data }) => {
          Swal.fire(
            'Your item has been removed from cart.'
          )
          context.dispatch('getCart')
          // console.log('success delete item',data)
        })
        .catch(error => {
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: error
          })
        })
    }
  },
  getters: {
    cart: state => state.cart,
    cartLength: state => state.cart.length,
    totalPrice: state => state.totalPrice
  },
  modules: {
  }
})
