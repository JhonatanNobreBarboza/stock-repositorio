<template>
     <div class="min-h-screen bg-gray-900 p-6">
       <div class="flex justify-between items-center mb-6">
         <h1 class="text-3xl font-bold text-white">Minhas Ações</h1>
         <button @click="logout" class="bg-red-600 text-white p-2 rounded hover:bg-red-700 transition-colors">Sair</button>
       </div>
       <div class="mb-6 bg-gray-800 p-6 rounded-lg shadow-lg">
         <h2 class="text-xl font-semibold text-white mb-4">Adicionar/Editar Ação</h2>
         <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
           <input v-model="form.ticker" placeholder="Ticker (ex: AAPL)" class="p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500" />
           <input v-model.number="form.quantity" type="number" placeholder="Quantidade" class="p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500" />
           <input v-model="form.purchase_date" type="date" class="p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500" />
         </div>
         <button @click="saveStock" class="mt-4 bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition-colors">{{ editingId ? 'Atualizar' : 'Adicionar' }}</button>
       </div>
       <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         <div v-for="stock in stocks" :key="stock.id" class="bg-gray-800 p-6 rounded-lg shadow-lg transform transition-all hover:scale-105 hover:shadow-xl">
           <h3 class="text-lg font-semibold text-white">{{ stock.ticker }}</h3>
           <p class="text-gray-300">Quantidade: {{ stock.quantity }}</p>
           <p class="text-gray-300">Data de Compra: {{ new Date(stock.purchase_date).toLocaleDateString() }}</p>
           <p class="text-green-400">Preço Atual: ${{ stock.current_price }}</p>
           <p class="text-blue-400">Total: ${{ (stock.current_price * stock.quantity).toFixed(2) }}</p>
           <div class="mt-4 flex space-x-2">
             <button @click="editStock(stock)" class="bg-yellow-600 text-white p-2 rounded hover:bg-yellow-700 transition-colors">Editar</button>
             <button @click="deleteStock(stock.id)" class="bg-red-600 text-white p-2 rounded hover:bg-red-700 transition-colors">Deletar</button>
           </div>
         </div>
       </div>
     </div>
   </template>

   <script>
   import axios from 'axios';
   import { ref } from 'vue';
   import { useRouter } from 'vue-router';

   export default {
     setup() {
       const stocks = ref([]);
       const form = ref({ ticker: '', quantity: 0, purchase_date: '' });
       const editingId = ref(null);
       const router = useRouter();
       const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

       const fetchStocks = async () => {
         try {
           const response = await axios.get(`${API_URL}/api/stocks`, {
             headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
           });
           stocks.value = response.data;
         } catch (err) {
           console.error(err);
         }
       };

       const saveStock = async () => {
         try {
           const payload = { ...form.value };
           if (editingId.value) {
             await axios.put(`${API_URL}/api/stocks/${editingId.value}`, payload, {
               headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
             });
           } else {
             await axios.post(`${API_URL}/api/stocks`, payload, {
               headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
             });
           }
           form.value = { ticker: '', quantity: 0, purchase_date: '' };
           editingId.value = null;
           fetchStocks();
         } catch (err) {
           console.error(err);
         }
       };

       const editStock = (stock) => {
         form.value = { ticker: stock.ticker, quantity: stock.quantity, purchase_date: stock.purchase_date };
         editingId.value = stock.id;
       };

       const deleteStock = async (id) => {
         try {
           await axios.delete(`${API_URL}/api/stocks/${id}`, {
             headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
           });
           fetchStocks();
         } catch (err) {
           console.error(err);
         }
       };

       const logout = () => {
         localStorage.removeItem('token');
         router.push('/');
       };

       fetchStocks();

       return { stocks, form, editingId, saveStock, editStock, deleteStock, logout };
     },
   };
   </script>