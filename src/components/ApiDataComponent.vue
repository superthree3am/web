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

        // Pastikan apiUrl tidak undefined sebelum melakukan request
        if (!apiUrl) {
          this.errorMessage = 'API URL is not defined in environment variables.';
          console.error('API URL (VUE_APP_SERVICE_API) is not defined.');
          this.isLoading = false;
          return; // Hentikan eksekusi jika apiUrl tidak ada
        }

        const response = await axios.get(`${apiUrl}/v1/register`);

        this.data = response.data;
      } catch (error) {
        // --- PERBAIKAN UNTUK SONARQUBE: LOG ERROR ---
        console.error('Error fetching data from API:', error);
        // Anda bisa memberikan pesan error yang lebih spesifik jika 'error.response' ada
        if (error.response) {
          this.errorMessage = `Error: ${error.response.status} - ${error.response.data.message || 'Server error'}`;
        } else if (error.request) {
          this.errorMessage = 'Network error: No response received from server.';
        } else {
          this.errorMessage = 'An unexpected error occurred while fetching data from the API.';
        }
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
