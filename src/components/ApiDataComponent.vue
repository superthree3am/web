<template>
  <div>
    <h1>Data dari API</h1>
    <div v-if="isLoading">Memuat data...</div>
    <div v-if="errorMessage" class="text-red-500">{{ errorMessage }}</div>
    <div v-if="data">
      <pre>{{ data }}</pre>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'ApiDataComponent',
  data() {
    return {
      data: null, 
      isLoading: false, 
      errorMessage: '', 
    };
  },
  created() {
    this.fetchData();
  },
  methods: {
    async fetchData() {
      this.isLoading = true; 
      this.errorMessage = ''; 
      try {
        
        const apiUrl = process.env.VUE_APP_SERVICE_API;
        
        const response = await axios.get(`${apiUrl}/v1/register`); 
        
        this.data = response.data; 
      } catch (error) {
        this.errorMessage = 'An error occurred while fetching data from the API'; 
      } finally {
        this.isLoading = false; 
      }
    },
  },
};
</script>

<style scoped>
/* Styling */
</style>
